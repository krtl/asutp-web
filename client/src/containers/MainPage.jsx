import React from 'react';
import Auth from '../modules/Auth';
import MainForm from '../components/MainForm';
import MyStompClient from '../modules/MyStompClient';


class MainFormPage extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      secretData: '',
    };
  }

  componentDidMount() {
    const xhr = new XMLHttpRequest();
    xhr.open('get', '/api/dashboard');
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    // set the authorization HTTP header
    xhr.setRequestHeader('Authorization', `bearer ${Auth.getToken()}`);
    xhr.responseType = 'json';
    xhr.addEventListener('load', () => {
      switch (xhr.status) {
        case 200: {
          this.setState({
            secretData: xhr.response.message,
          });
          MyStompClient.connect(this.doOnWebsocketConnected);
          break;
        }
        case 401: {
          Auth.deauthenticateUser();
          window.location.reload();
          break;
        }
        default: {
          // what should I do ?
          break;
        }
      }
    });
    xhr.send();
  }

  doOnWebsocketConnected(err) {
    if (!err){

    }
  }

  render() {
    return (<MainForm
      secretData={this.state.secretData}
    />);
  }

}

export default MainFormPage;
