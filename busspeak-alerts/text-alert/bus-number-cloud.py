import json
import boto3
import time
import os
import re
import decimal
import io

s3 = boto3.client("s3")
rekognition = boto3.client("rekognition")
iotClient = boto3.client("iot-data")


def lambda_handler(event, context):
    model = "arn:aws:rekognition:ap-northeast-1:868750684322:project/busspeak/version/busspeak.2023-01-31T22.11.17/1675174278127"

    utime = str(int(time.time()))  # Current Unix Time
    bucket = event["Records"][0]["s3"]["bucket"]["name"]
    key = event["Records"][0]["s3"]["object"]["key"]
    # bucket = 'busspeakmodel'
    # key = 'assets/testing/img (7).png'
    image = {
        "S3Object": {
            "Bucket": bucket,
            "Name": key,
        }
    }
    
    customlabelresponse = rekognition.detect_custom_labels(Image={'S3Object': {'Bucket': bucket, 'Name': key}}, ProjectVersionArn=model)
    
    
    for customLabel in customlabelresponse["CustomLabels"]:
        if "Geometry" in customLabel:
            box = customLabel["Geometry"]["BoundingBox"]
            width = box["Width"]
            height = box["Height"]

            updateh = height - 0.01
            updatew = width - 0.01
            print("detect: " + repr(updateh))
            print("detect: " + repr(updatew))
            boxFilter = {
                "WordFilter": {
                    "MinBoundingBoxHeight": updateh,
                    "MinBoundingBoxWidth": updatew,
                }
            }
            response = rekognition.detect_text(Image=image, Filters=boxFilter)
            for customLabel in response["TextDetections"]:
                if "DetectedText" in customLabel:
                    busNum = customLabel["DetectedText"]
                    return busNum
                else:
                    print("Bus Number cant be read")
                    return False
        else:
            msg = "Bus Number not found in the image"
            return msg
            break
            

# import json
# import boto3
# import time
# import os
# import re
# import decimal
# import io

# client = boto3.Session(
#     aws_access_key_id='AKIA4URMTOCRGWQY35FZ',
#     aws_secret_access_key='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').client('rekognition')

# def lambda_handler(event, context):
#     main()


# def get_custom_labels(model, bucket, photo):
#     # client = boto3.client('rekognition')

#     # Call DetectCustomLabels
#     response = client.detect_custom_labels(
#         Image={'S3Object': {'Bucket': bucket, 'Name': photo}}, ProjectVersionArn=model)
#     #print(response)
#     for customLabel in response['CustomLabels']:
#         if 'Geometry' in customLabel:
#             box = customLabel['Geometry']['BoundingBox']
#             left = box['Left']
#             top = box['Top']
#             width = box['Width']
#             height = box['Height']

#             get_custom_label_word(bucket, photo, height, width)


# def get_custom_label_word(bucket, photo, h, w):
#     # client = boto3.client('rekognition')

#     updateh = h - 0.01
#     updatew = w - 0.01

#     #print("detect: "+repr(updateh))
#     #print("detect: "+repr(updatew))

#     image = {'S3Object': {
#         'Bucket': bucket,
#         'Name': photo,
#     }
#     }

#     boxFilter = {'WordFilter': {
#         'MinBoundingBoxHeight': updateh,
#         'MinBoundingBoxWidth': updatew,
#     }
#     }

#     response = client.detect_text(Image=image, Filters=boxFilter)
#     # print(response)
#     for customLabel in response['TextDetections']:
#         if 'DetectedText' in customLabel:
#             print(customLabel['DetectedText'])
    


# def main():

#     bucket = 'busspeakmodelbucket'
#     photo = 'assets/training/img (10).png'
#     model = 'arn:aws:rekognition:ap-southeast-1:868750684322:project/busspeakdetector/version/busspeakdetector.2022-12-22T13.14.58/1671686097589'

#     get_custom_labels(model, bucket, photo)


# if __name__ == "__main__":
#     main()
