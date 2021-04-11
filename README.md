<h1 align='center'>RoShamBo TensorFlow</h1>
<h2 align="center">VideoChat Rock Paper Scissors</h2>
<p align="center"><a href="https://roshambo.xyz">live now at roshambo.xyz</a></p>

<hr/>
<h2 align='center'>Table of Contents</2>
<p align='center'><a href='#description'>Description</a></p>
<p align='center'><a href='#installation'>Installation</a></p>
<p align='center'><a href='#usage'>Usage</a></p>
<p align='center'><a href='#license'>License</a></p>
<p align='center'><a href='#questions'>Questions</a></p>
<hr/>

<h2>Description</h2>
<p align="center">
Built in MERN stack with tensor-flow, WebRTC, socketIO, and Material UI. Users can battle a computer, friends, or random users in a rock paper scissors fight to the death, using their their webcams and hand gestures to select weapons. The Fingerpose package, built on top of Tensorflow's <a href="https://github.com/tensorflow/tfjs-models/tree/master/handpose">Handpose model</a>, is used to determine the user's hand gesture based on snapshots from their webcam stream.  
While researching tensor-flow I came across a crazy cool <a href="https://www.youtube.com/watch?v=WajtPtLAg-o">video</a> / <a href="https://github.com/nicknochnack/CustomGestureRecognition">demo</a> by Nicholas Renotte which detects hand poses and draws a canvas animation over the user's webcam.</p>
<p>Inspired by Renotte's project, and using the same technique to detect gestures, I built some of my own handposes, and a social media/video chat/websocket game based around using this as the player's controller.</p>
<p>This is just a game, and currently there are limitations to the handpose model (detects only one hand), but the possible future use of machine learning and hand gestures for user interface controls (and maybe even things like sign language detection) is extremely exciting.</p>
<hr/>
<h2>Installation</h2>
<p>Download the repo and run<p>

    npm run install-all

<p>Also needed is a .env file in the root directory with a MONGO_URI property set to a mongoDB connection string and SECRET property set to whatever you want your secret to be- any long, random string will do.</p>
<p>To run the project locally use the command<p>

    npm run dev

<p>This will start the server at <a href="http://localhost:8000">localhost:8000</a></p>
<p>And the user interface at <a href="http://localhost:3000">localhost:3000</a></p>
<hr/>
<h2>Usage</h2>

<p></p>

<hr/>
<h2>License</h2>
<p><img src='https://img.shields.io/badge/license-MIT-half' alt='license'></img>
<hr/>
<h2>Questions</h2>
<p>Any questions on this or other projects can be directed to thomasjfoydel@gmail.com </p>
<hr/>
<h2>More Of My Projects</h2>
<p>Thanks for checking this out! Find more of my work on <a href='https://github.com/thomasfoydel'>my GitHub</a></p>
