import cv2
import torch
import face_alignment
import numpy as np
from skimage.transform import resize
from skimage import img_as_ubyte
import demo
import time

def extract_bbox(frame, fa):
    if max(frame.shape[0], frame.shape[1]) > 640:
        scale_factor =  max(frame.shape[0], frame.shape[1]) / 640.0
        frame = resize(frame, (int(frame.shape[0] / scale_factor), int(frame.shape[1] / scale_factor)))
        frame = img_as_ubyte(frame)
    else:
        scale_factor = 1
    frame = frame[..., :3]
    bboxes = fa.face_detector.detect_from_image(frame[..., ::-1])
    if len(bboxes) == 0:
        return []
    return np.array(bboxes)[:, :-1] * scale_factor

def bb_intersection_over_union(boxA, boxB):
    xA = max(boxA[0], boxB[0])
    yA = max(boxA[1], boxB[1])
    xB = min(boxA[2], boxB[2])
    yB = min(boxA[3], boxB[3])
    interArea = max(0, xB - xA + 1) * max(0, yB - yA + 1)
    boxAArea = (boxA[2] - boxA[0] + 1) * (boxA[3] - boxA[1] + 1)
    boxBArea = (boxB[2] - boxB[0] + 1) * (boxB[3] - boxB[1] + 1)
    iou = interArea / float(boxAArea + boxBArea - interArea)
    return iou


def join(tube_bbox, bbox):
    xA = min(tube_bbox[0], bbox[0])
    yA = min(tube_bbox[1], bbox[1])
    xB = max(tube_bbox[2], bbox[2])
    yB = max(tube_bbox[3], bbox[3])
    return (xA, yA, xB, yB)

def process_frame(frame, fa):
    global prev_bbox
    frame_shape = frame.shape
    bboxes = extract_bbox(frame, fa)
    #  return the first bbox in the list
    if len(bboxes) == 0:
        return (False, frame)
    for bbox in bboxes:
        # modify the bbox
        middle_width = (bbox[0] + bbox[2]) / 2
        middle_height = (bbox[1] + bbox[3]) / 2
        height = (bbox[3] - bbox[1])*1.5
        width = height
        bbox = (middle_width - width/2, middle_height - height/2, middle_width + width/2, middle_height + height/2)
        if prev_bbox == None:
            prev_bbox = bbox
        # lowpass the bbox aspect ratio
        # if total distance less than 
        center_old = ((prev_bbox[0] + prev_bbox[2]) / 2, (prev_bbox[1] + prev_bbox[3]) / 2)
        center_new = ((bbox[0] + bbox[2]) / 2, (bbox[1] + bbox[3]) / 2)
        if (abs(center_new[0] - center_old[0]) + abs(center_new[1] - center_old[1])) < 30:
            alpha = 0.9
        else:
            alpha = 0.7
        # print(alpha)
        beta = 1-alpha
        prev_bbox = (prev_bbox[0] * alpha + bbox[0] * beta, prev_bbox[1] * alpha + bbox[1] * beta, prev_bbox[2] * alpha + bbox[2] * beta, prev_bbox[3] * alpha + bbox[3] * beta)
        # top_left = (int(bbox[0]), int(bbox[1]))
        # bottom_right = (int(bbox[2]), int(bbox[3]))
        frame = frame[int(prev_bbox[1]):int(prev_bbox[3]), int(prev_bbox[0]):int(prev_bbox[2])]
        # check frame size
        if frame.shape[0] < 32 or frame.shape[1] < 32:
            return (False, frame)
        break
    # Return the result
    return (True, frame)

global prev_bbox

if __name__ == '__main__':
    # source image
    source_image = cv2.imread('./demo/images/41.png')
    #  resize the image to 256 * 256
    source_image = cv2.resize(source_image, (256, 256))
    source_image = np.array(source_image, dtype=np.float32)/255.0
    source = torch.from_numpy(source_image).unsqueeze(0).permute(0, 3, 1, 2)
    source = source.cuda()
    model_path = './vox-cpk.pth.tar'
    config_path = './config/vox-256.yaml'
    generator, kp_detector = demo.load_checkpoints(config_path=config_path, checkpoint_path=model_path)
    kp_source = kp_detector(source)
    print('model loaded')
    # print(generator, kp_detector)
    # Initialize the face alignment object
    fa = face_alignment.FaceAlignment(face_alignment.LandmarksType.TWO_D, flip_input=False, device='cuda')

    # Set up the webcam, at 640x480 resolution
    cap = cv2.VideoCapture(0)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 680)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
    cap.set(cv2.CAP_PROP_FPS, 60)
    last_time = time.time()
    # global prev_bbox
    prev_bbox = None
    counter=0

    with torch.no_grad():
        while(True):
            # Print the FPS
            counter+=1
            if counter%30==0:
                print("FPS: ", 1 / (time.time() - last_time))
            last_time = time.time()
            # Capture frame-by-frame
            ret, frame = cap.read()

            if not ret:
                print("Failed to grab frame")
                break
            
            #  rotate the image by 90 degrees
            frame = cv2.rotate(frame, cv2.ROTATE_90_COUNTERCLOCKWISE)
            # Call your function to process each frame
            result = process_frame(frame, fa)
            # resize the image to 256 * 256
            if result[0]:
                # swap the channels
                result_ = cv2.cvtColor(result[1], cv2.COLOR_BGR2RGB)
                result_ = cv2.resize(result_, (256, 256), interpolation=cv2.INTER_CUBIC) 
                result_ = (np.array(result_, dtype=np.float32)//10.0)
                result_=result_/25.5
                # print(result.shape)
                driving = torch.from_numpy(result_).unsqueeze(0).permute(0, 3, 1, 2)
                driving = driving.cuda()
                kp_driving = kp_detector(driving)
                
                out = generator(source, kp_source=kp_source, kp_driving=kp_driving)
                out = np.transpose(out['prediction'].data.cpu().numpy(), [0, 2, 3, 1])[0]
                # result = out
                cv2.imshow('Manip', out)
                # result = cv2.cvtColor(result, cv2.COLOR_RGB2BGR)
            # Display the resulting frame
            # result = cv2.cvtColor(result, cv2.COLOR_RGB2BGR)
            if result[1].shape[0] > 0 and result[1].shape[1] > 0:
                cv2.imshow('Frame', result[1])
            else:
                cv2.imshow('Frame', frame)

            # Break the loop when 'q' key is pressed
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break

        # When everything done, release the video capture object
        cap.release()

        # Closes all the frames
        cv2.destroyAllWindows()
