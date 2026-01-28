import React from "react";
import PropTypes from "prop-types";

import Auth from "../modules/Auth";
import LoginForm from "../components/LoginForm.jsx";


export default function LoginPage(props) {

  const [errors, setErrors] = React.useState({});
  const [successMessage, setSuccessMessage] = React.useState("");
  const [user, setUser] = React.useState({
        email: "",
        password: ""
      });


  const storedMessage = localStorage.getItem("successMessage");
  if (storedMessage) {
      setSuccessMessage(storedMessage);
      localStorage.removeItem("successMessage");
    }



  const handleProcessForm = () => {
    // prevent default action. in this case, action is the form submission event
    // event.preventDefault();

    // create a string for an HTTP body message
    const email = encodeURIComponent(user.email);
    const password = encodeURIComponent(user.password);
    const formData = `email=${email}&password=${password}`;

    // create an AJAX request
    const xhr = new XMLHttpRequest();
    xhr.open("post", "/auth/login");
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhr.responseType = "json";
    xhr.addEventListener("load", () => {
      if (xhr.status === 200) {
        // success

        // change the component-container state
        setErrors({});

        // save the token and data
        Auth.authenticateUser(xhr.response.token, xhr.response.user.name);

        // change the current URL to /
        props.history.push("/");
        // context.router.history.replace("/");
      } else {
        // failure
        // change the component state
        let errors = {};

        if (xhr.response === null) {
          errors ={
            summary: `${xhr.status}  ${xhr.statusText}`
          };
        } else {
           errors = xhr.response.errors ? xhr.response.errors : {};
        errors.summary = xhr.response.message;
        }

        setErrors(errors);
      }
    });
    xhr.send(formData);
  }

  const handleChange = (event) => {
    const field = event.target.name;
    const locUser = {
        email: user.email,
        password: user.password
      };
    locUser[field] = event.target.value;
    setUser(locUser);
  }


    return (
      <LoginForm
        onSubmit={handleProcessForm}
        onChange={handleChange}
        errors={errors}
        successMessage={successMessage}
        user={user}
      />
    );
}

LoginPage.contextTypes = {
  // router: PropTypes.object.isRequired
  router: PropTypes.shape({
    history: PropTypes.object.isRequired
  })
};


