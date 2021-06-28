<h1 align='center'>RoShamBo TensorFlow</h1>
<h2 align='center'>Video-Chat Rock Paper Scissors</h2>
<p align='center'><a href='https://roshambo.xyz'>live now at roshambo.xyz</a></p>

<a href='https://roshambo.xyz'>
<p align='center'><img src='assets/images/screenshot.png' alt='screenshot of the homepage of the application'/><p>
</a>

<hr/>
<h2 align='center'>Table of Contents</2>
<p align='center'><a href='#description'>Description</a></p>
<p align='center'><a href='#installation'>Installation</a></p>
<p align='center'><a href='#usage'>Usage</a></p>
<p align='center'><a href='#license'>License</a></p>
<p align='center'><a href='#questions'>Questions</a></p>
<hr/>


<h2>Description</h2>
<p>
Built in MERN stack with tensor-flow, WebRTC, socketIO, and Material UI. Users can battle a computer, friends, or random users in a rock paper scissors fight to the death, using their webcams and hand gestures to select weapons. The Fingerpose package, built on top of tensor-flow's <a href='https://github.com/tensorflow/tfjs-models/tree/master/handpose'>Handpose model</a>, is used to determine the user's hand gesture based on snapshots from their webcam stream. Authentication is JWT based and the front-end state management relies on React's context API.  
</p>
<p>While researching tensor-flow I came across a crazy cool <a href='https://www.youtube.com/watch?v=WajtPtLAg-o'>video</a> / <a href='https://github.com/nicknochnack/CustomGestureRecognition'>demo</a> by Nicholas Renotte which detects hand poses and draws a canvas animation over the user's webcam. Inspired by Renotte's project, and using the same technique to detect gestures, I built some of my own handposes, and a social media/video-chat/websocket game based around using this as the player's controller.</p>
<p>This is just a game, and currently there are limitations to the handpose model (detects only one hand), but the possible future use of machine learning and hand gestures for user interface controls (and maybe even things like sign language detection) is extremely exciting.</p>
<hr/>


<h2>Installation</h2>
<p>Download the repo and run<p>

    npm run install-all

<p>Also needed is a .env file in the root directory with a MONGO_URI property set to a mongoDB connection string and SECRET property set to whatever you want your secret to be- any long, random string will do.</p>
<p>To run the project locally use the command<p>

    npm run dev

<p>This will start the server at <a href='http://localhost:8000'>localhost:8000</a></p>
<p>And the user interface at <a href='http://localhost:3000'>localhost:3000</a></p>
<hr/>
<h2>Usage</h2>
<p>Users can select weapons using their hand gesture once the game begins and a round has started</p>
<p align='center'><img src='assets/images/screenshot2.png' alt='a player selecting a weapon using hand gesture' /></p>
<p>Once both players have selected their weapon choices and the data is sent to the server, the round outcome is sent back to the users and their health bars are updated, sound effects are triggered, and then the next round begins.</p>
<p align='center'><img src='assets/images/screenshot3.png' alt='two players during a round outcome' /></p>

<p>Rock beats scissors and bird. Paper beats rock and tree. Scissors beats paper and bird. Tree beats scissors and rock. Bird beats tree and paper.</p>
<p align='center'><img src='assets/images/weaponsystem.png' alt='weapon symbols with arrows denoting victories' /></p>

<p align='center'><img src='assets/images/instructions.gif' alt='five hand gestures, rock is a raised fist, paper is a raised open hand, scissors is like a peace sign with the index and middle fingers, tree is a thumbs down, bird is a raised fist with the pinky finger extended as if to drink tea like a fancy person' /></p>
<hr/>

<h2>License</h2>
<p><img src='https://img.shields.io/badge/license-MIT-half' alt='license'></img>
<hr/>
<h2>Questions</h2>
<p>Any questions on this or other projects can be directed to thomasjfoydel@gmail.com </p>
<hr/>
<h2>More Of My Projects</h2>
<p>Thanks for checking this out! Find more of my work on <a href='https://github.com/thomasfoydel'>my GitHub</a></p>
