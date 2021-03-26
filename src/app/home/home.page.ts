import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';

// Tensorflow Setups
import * as tensorflow from '@tensorflow/tfjs';
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';
import { AnnotatedPrediction, MediaPipeFaceMesh } from '@tensorflow-models/face-landmarks-detection/dist/mediapipe-facemesh';

// Set the backend of tensorflow
tensorflow.setBackend('cpu');

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements AfterViewInit {
  @ViewChild('VideoElement') videoElement: ElementRef<HTMLVideoElement>;
  @ViewChild('CanvasElement') canvasElement: ElementRef<HTMLCanvasElement>;

  constructor() {}

  ngAfterViewInit() {
    alert('Started');
    // Get the stream from the webcam
    navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      .then((videoStream) => {
        this.videoElement.nativeElement.srcObject = videoStream
      });

    // Wait for the video to load and start playing to start detecting the face landmarks
    this.videoElement.nativeElement.onplaying = (_) => {
      this.runFaceLandmarksDetection();
    };
  }

  async runFaceLandmarksDetection() {
    const neuralNetworkModel = await faceLandmarksDetection.load(faceLandmarksDetection.SupportedPackages.mediapipeFacemesh);
    this.detectFacesFromVideo(neuralNetworkModel);
  }

  async detectFacesFromVideo(neuralNetworkModel: MediaPipeFaceMesh) {
    const faceLandmarks = await neuralNetworkModel.estimateFaces({ input: this.videoElement.nativeElement })

    // Get the width and height of the video element
    const height = this.videoElement.nativeElement.height;
    const width = this.videoElement.nativeElement.width;

    // Set the height and width of the canvas element
    this.canvasElement.nativeElement.height = height;
    this.canvasElement.nativeElement.width = width;

    // Get the context of the canvas
    const canvasContext = this.canvasElement.nativeElement.getContext('2d');
    this.drawFaceMesh(faceLandmarks, canvasContext);
    requestAnimationFrame(() => this.detectFacesFromVideo(neuralNetworkModel));
  }

  drawFaceMesh(faces: AnnotatedPrediction[] | any[], ctx: CanvasRenderingContext2D) {
    // Clear the context
    ctx.clearRect(0, 0, this.canvasElement.nativeElement.width, this.canvasElement.nativeElement.height);

    faces.forEach((face) => {
      const faceLandmarks = face.scaledMesh;

      // DOTS
      for (let index = 0; index < faceLandmarks.length; index++) {
        const xLandmark = faceLandmarks[index][0];
        const yLandmark = faceLandmarks[index][1];

        ctx.beginPath();
        ctx.arc(xLandmark, yLandmark, 1, 0, 3 * Math.PI);
        ctx.fillStyle = 'yellow';
        ctx.strokeStyle = 'black';
        ctx.fill();
        ctx.stroke();
      }
    });
  }
}
