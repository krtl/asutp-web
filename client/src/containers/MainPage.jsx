import React from 'react';
import Auth from '../modules/Auth';
import Dashboard from '../components/MainForm';


class DashboardPage extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      secretData: '',
      recs: [],
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

  render() {
    return (<Dashboard
      secretData={this.state.secretData}
      recs={this.state.nodes}
    />);
  }

}

export default DashboardPage;
