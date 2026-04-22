# AWS Lambda Function for Processing Toll Crossings (Python)
# Deploy this to AWS Lambda Console with Python 3.11 runtime

import json
import boto3
import os
from datetime import datetime
from decimal import Decimal

dynamodb = boto3.resource('dynamodb', region_name=os.environ['AWS_REGION'])
sns_client = boto3.client('sns', region_name=os.environ['AWS_REGION'])

def lambda_handler(event, context):
    print('Received event:', json.dumps(event))
    
    try:
        # Parse EventBridge geofence event
        detail = event['detail']
        event_type = detail['EventType']
        geofence_id = detail['GeofenceId']
        device_id = detail['DeviceId']
        position = detail['Position']
        geofence_properties = detail.get('GeofenceProperties', {})
        
        # Only process ENTER events
        if event_type != 'ENTER':
            return {
                'statusCode': 200,
                'body': json.dumps({'message': 'Ignored EXIT event'})
            }
        
        # Extract toll information from geofence properties
        toll_amount = float(geofence_properties.get('toll_amount', 0))
        toll_name = geofence_properties.get('name', 'Unknown Toll')
        toll_road = geofence_properties.get('toll_road', 'Unknown Road')
        
        # Get user's primary vehicle (deviceId should be userID)
        user_id = device_id
        
        # Query for user's primary vehicle
        vehicles_table = dynamodb.Table('QuickSilver-Vehicles')
        try:
            vehicle_response = vehicles_table.get_item(
                Key={'userID': user_id, 'id': 'primary'}
            )
            primary_vehicle = vehicle_response.get('Item', {})
            license_plate = primary_vehicle.get('license_plate', 'Unknown')
        except Exception as e:
            print(f'Error fetching vehicle: {e}')
            license_plate = 'Unknown'
        
        # Create pending trip record
        trip_id = f"trip-{int(datetime.now().timestamp() * 1000)}"
        now_iso = datetime.utcnow().isoformat() + 'Z'
        
        trip = {
            'id': trip_id,
            'userID': user_id,
            'toll_location': toll_name,
            'toll_road': toll_road,
            'entry_time': now_iso,
            'license_plate': license_plate,
            'amount': Decimal(str(toll_amount)),
            'status': 'pending',
            'payment_method': None,
            'confirmation_number': None,
            'position': position,
            'geofence_id': geofence_id,
            'created_date': now_iso,
            'updated_date': now_iso,
            'created_by': user_id
        }
        
        trips_table = dynamodb.Table('QuickSilver-Trips')
        trips_table.put_item(Item=trip)
        
        # Create notification record
        notification_id = f"notif-{int(datetime.now().timestamp() * 1000)}"
        notification = {
            'id': notification_id,
            'userID': user_id,
            'type': 'toll_detected',
            'title': 'Toll Detected',
            'message': f'{toll_name} toll detected - ${toll_amount:.2f}. Tap to pay.',
            'is_read': False,
            'priority': 'high',
            'metadata': {
                'trip_id': trip_id,
                'toll_location': toll_name,
                'amount': toll_amount
            },
            'trip_id': trip_id,
            'created_date': now_iso,
            'updated_date': now_iso
        }
        
        notifications_table = dynamodb.Table('QuickSilver-Notifications')
        notifications_table.put_item(Item=notification)
        
        # Send push notification via SNS (optional)
        if 'SNS_TOPIC_ARN' in os.environ:
            try:
                sns_client.publish(
                    TopicArn=os.environ['SNS_TOPIC_ARN'],
                    Message=json.dumps({
                        'title': 'Toll Detected',
                        'body': f'{toll_name} - ${toll_amount:.2f}',
                        'data': {
                            'trip_id': trip_id,
                            'type': 'toll_detected'
                        }
                    }),
                    MessageAttributes={
                        'userId': {'DataType': 'String', 'StringValue': user_id}
                    }
                )
            except Exception as sns_error:
                print(f'SNS Error (non-critical): {sns_error}')
        
        return {
            'statusCode': 200,
            'body': json.dumps({
                'message': 'Toll crossing processed successfully',
                'tripId': trip_id,
                'tollAmount': toll_amount
            })
        }
        
    except Exception as error:
        print(f'Error processing toll crossing: {error}')
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(error)})
        }