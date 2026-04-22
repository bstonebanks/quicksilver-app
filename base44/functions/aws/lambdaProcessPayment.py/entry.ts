# AWS Lambda Function for Processing Toll Payments (Python)
# Deploy this to AWS Lambda Console with Python 3.11 runtime

import json
import boto3
import os
from datetime import datetime
from decimal import Decimal

dynamodb = boto3.resource('dynamodb', region_name=os.environ['AWS_REGION'])
ses_client = boto3.client('ses', region_name=os.environ['AWS_REGION'])

def lambda_handler(event, context):
    print('Received payment event:', json.dumps(event))
    
    try:
        # Parse payment event data
        body = json.loads(event.get('body', '{}')) if isinstance(event.get('body'), str) else event
        
        trip_id = body['tripId']
        user_id = body['userId']
        payment_method_id = body['paymentMethodId']
        
        # Fetch trip details
        trips_table = dynamodb.Table('QuickSilver-Trips')
        trip_response = trips_table.get_item(
            Key={'userID': user_id, 'id': trip_id}
        )
        
        if 'Item' not in trip_response:
            return {
                'statusCode': 404,
                'body': json.dumps({'error': 'Trip not found'})
            }
        
        trip = trip_response['Item']
        
        # Fetch payment method details
        payment_methods_table = dynamodb.Table('QuickSilver-PaymentMethods')
        pm_response = payment_methods_table.get_item(
            Key={'userID': user_id, 'id': payment_method_id}
        )
        
        if 'Item' not in pm_response:
            return {
                'statusCode': 404,
                'body': json.dumps({'error': 'Payment method not found'})
            }
        
        payment_method = pm_response['Item']
        
        # Generate confirmation number
        confirmation_number = f"QS{int(datetime.now().timestamp())}"[-8:]
        
        # Update trip with payment info
        now_iso = datetime.utcnow().isoformat() + 'Z'
        trips_table.update_item(
            Key={'userID': user_id, 'id': trip_id},
            UpdateExpression='SET #status = :status, payment_method = :pm, confirmation_number = :conf, updated_date = :updated',
            ExpressionAttributeNames={'#status': 'status'},
            ExpressionAttributeValues={
                ':status': 'paid',
                ':pm': payment_method['last_four'],
                ':conf': confirmation_number,
                ':updated': now_iso
            }
        )
        
        # Create payment success notification
        notification_id = f"notif-{int(datetime.now().timestamp() * 1000)}"
        notification = {
            'id': notification_id,
            'userID': user_id,
            'type': 'payment_success',
            'title': 'Payment Successful',
            'message': f'Your ${float(trip["amount"]):.2f} toll payment has been processed. Confirmation: {confirmation_number}',
            'is_read': False,
            'priority': 'medium',
            'metadata': {
                'trip_id': trip_id,
                'amount': float(trip['amount']),
                'confirmation_number': confirmation_number
            },
            'trip_id': trip_id,
            'created_date': now_iso,
            'updated_date': now_iso
        }
        
        notifications_table = dynamodb.Table('QuickSilver-Notifications')
        notifications_table.put_item(Item=notification)
        
        # Send email receipt via SES
        try:
            email_html = f"""
            <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
                    <h1 style="color: white; margin: 0;">QuickSilver Instant Pay</h1>
                </div>
                <div style="padding: 30px; background: #f9fafb;">
                    <h2 style="color: #1f2937;">Payment Confirmation</h2>
                    <p style="color: #4b5563; font-size: 16px;">Your toll payment has been successfully processed.</p>
                    
                    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 10px 0; color: #6b7280;">Confirmation Number:</td>
                                <td style="padding: 10px 0; font-weight: bold; color: #1f2937;">{confirmation_number}</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px 0; color: #6b7280;">Amount:</td>
                                <td style="padding: 10px 0; font-weight: bold; color: #1f2937;">${float(trip['amount']):.2f}</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px 0; color: #6b7280;">Toll Location:</td>
                                <td style="padding: 10px 0; font-weight: bold; color: #1f2937;">{trip['toll_location']}</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px 0; color: #6b7280;">Toll Road:</td>
                                <td style="padding: 10px 0; font-weight: bold; color: #1f2937;">{trip['toll_road']}</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px 0; color: #6b7280;">Vehicle:</td>
                                <td style="padding: 10px 0; font-weight: bold; color: #1f2937;">{trip['license_plate']}</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px 0; color: #6b7280;">Payment Method:</td>
                                <td style="padding: 10px 0; font-weight: bold; color: #1f2937;">**** {payment_method['last_four']}</td>
                            </tr>
                        </table>
                    </div>
                    
                    <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                        Thank you for using QuickSilver Instant Pay. Drive safe!
                    </p>
                </div>
            </body>
            </html>
            """
            
            ses_client.send_email(
                Source='noreply@quicksilver.com',
                Destination={'ToAddresses': [user_id]},
                Message={
                    'Subject': {'Data': f'Payment Confirmation - {confirmation_number}'},
                    'Body': {'Html': {'Data': email_html}}
                }
            )
        except Exception as ses_error:
            print(f'SES Error (non-critical): {ses_error}')
        
        return {
            'statusCode': 200,
            'body': json.dumps({
                'message': 'Payment processed successfully',
                'confirmationNumber': confirmation_number,
                'tripId': trip_id
            })
        }
        
    except Exception as error:
        print(f'Error processing payment: {error}')
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(error)})
        }