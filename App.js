import React, {Component} from 'react';
import {Dimensions, StatusBar, StyleSheet, Text, View} from 'react-native';
import {Icon} from 'react-native-elements';
import {TouchableRipple} from 'react-native-paper';
import {SafeAreaView} from 'react-native-safe-area-context';
import {
  RTCPeerConnection,
  RTCIceCandidate,
  RTCSessionDescription,
  RTCView,
  MediaStream,
  MediaStreamTrack,
  mediaDevices,
  registerGlobals,
} from 'react-native-webrtc';
import {Bg, First, Second, White} from './Colors';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Second,
    justifyContent: 'center',
    alignItems: 'center',
  },
  safeArea: {...StyleSheet.absoluteFill},
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    margin: 5,
  },
});

const {width, height} = Dimensions.get('screen');

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      stream: null,
      front: true,
    };
  }

  startCall = async () => {
    const {front} = this.state;
    console.log('start', front);
    const configuration = {iceServers: [{url: 'stun:stun.l.google.com:19302'}]};
    const pc = new RTCPeerConnection(configuration);

    mediaDevices.enumerateDevices().then(sourceInfos => {
      console.log(sourceInfos);
      let videoSourceId;
      for (let i = 0; i < sourceInfos.length; i += 1) {
        const sourceInfo = sourceInfos[i];
        if (
          sourceInfo.kind === 'videoinput' &&
          sourceInfo.facing === (front ? 'user' : 'environment')
        ) {
          videoSourceId = sourceInfo.deviceId;
        }
      }
      mediaDevices
        .getUserMedia({
          audio: true,
          video: {
            facingMode: front ? 'user' : 'environment',
            optional: {
              deviceId: videoSourceId,
            },
            minFrameRate: 30,
          },
          width,
          height,
        })
        .then(liveStream => {
          // Got stream!
          this.setState({
            stream: liveStream.toURL(),
          });
          pc.addStream(liveStream);
        })
        .catch(error => {
          // Log error
          console.log(error);
        });
    });

    pc.createOffer().then(desc => {
      pc.setLocalDescription(desc).then(() => {
        // Send pc.localDescription to peer
      });
    });

    pc.onicecandidate = function (event) {
      // send event.candidate to peer
    };

    // if (!stream) {
    //   let s;
    //   try {
    //     s = await mediaDevices.getUserMedia({
    //       video: true,
    //       audio: true,
    //       width,
    //       height,
    //       facingMode: front ? 'user' : 'environment',
    //     });
    //     this.setState({stream: s});
    //     console.log(s, 'stream');
    //   } catch (e) {
    //     console.error(e);
    //   }
    // }
  };

  endCall = async () => {
    console.log('stopping');
    const {stream} = this.state;
    if (stream) {
      stream.release();
      this.setState({stream: null});
    }
  };

  render() {
    const {stream, front} = this.state;
    console.log(stream, 'stream');
    return (
      <View style={styles.container}>
        <StatusBar hidden />
        <SafeAreaView style={styles.safeArea}>
          {stream && <RTCView mirror streamURL={stream} style={{flex: 1}} />}
          <View style={styles.footer}>
            <TouchableRipple
              style={{
                elevation: 20,
                borderRadius: 5,
                backgroundColor: First,
                padding: 5,
              }}
              borderless
              onPress={this.startCall}
              rippleColor="whitesmoke">
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: 'bold',
                  color: White,
                }}>
                Start
              </Text>
            </TouchableRipple>
            <TouchableRipple
              style={{
                elevation: 20,
                borderRadius: 5,
                backgroundColor: First,
                padding: 5,
              }}
              borderless
              onPress={this.endCall}
              rippleColor="whitesmoke">
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: 'bold',
                  color: White,
                }}>
                Stop
              </Text>
            </TouchableRipple>
            <TouchableRipple
              style={{
                elevation: 20,
                borderRadius: 5,
                backgroundColor: First,
                padding: 5,
              }}
              borderless
              // onPress={() => this.setState({front: !front})}
              rippleColor="whitesmoke">
              <Icon
                name="camera"
                type="feather"
                color={White}
                iconStyle={{fontSize: 20}}
              />
            </TouchableRipple>
          </View>
        </SafeAreaView>
      </View>
    );
  }
}

export default App;
