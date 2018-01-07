import React from 'react';
import MyParamHistoryForm from '../components/MyParamHistoryForm';


class MainFormPage extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      secretData: '',
      recs: [],
    };
  }

  componentDidMount() {

  }


  render() {
    return (<MyParamHistoryForm />);
  }

}

export default MainFormPage;
