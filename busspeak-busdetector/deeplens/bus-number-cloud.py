import json
import boto3
import time
import os
import re
import decimal
import io


def lambda_handler(event, context):
    main()


def get_custom_labels(model, bucket, photo):
    client = boto3.client('rekognition')

    # Call DetectCustomLabels
    response = client.detect_custom_labels(
        Image={'S3Object': {'Bucket': bucket, 'Name': photo}}, ProjectVersionArn=model)
    print(response)
    for customLabel in response['CustomLabels']:
        if 'Geometry' in customLabel:
            box = customLabel['Geometry']['BoundingBox']
            left = box['Left']
            top = box['Top']
            width = box['Width']
            height = box['Height']

            get_custom_label_word(bucket, photo, height, width)


def get_custom_label_word(bucket, photo, h, w):
    client = boto3.client('rekognition')

    updateh = h - 0.01
    updatew = w - 0.01

    print("detect: "+repr(updateh))
    print("detect: "+repr(updatew))

    image = {'S3Object': {
        'Bucket': bucket,
        'Name': photo,
    }
    }

    boxFilter = {'WordFilter': {
        'MinBoundingBoxHeight': updateh,
        'MinBoundingBoxWidth': updatew,
    }
    }

    response = client.detect_text(Image=image, Filters=boxFilter)

    print(response)


def main():

    bucket = 'busspeakmodelbucket'
    photo = 'assets/training/img (10).png'
    model = 'arn:aws:rekognition:ap-southeast-1:868750684322:project/busspeakdetector/version/busspeakdetector.2022-12-22T13.14.58/1671686097589'

    get_custom_labels(model, bucket, photo)


if __name__ == "__main__":
    main()
