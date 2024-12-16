class Auth {
  static authenticateUser(token, data) {
    localStorage.setItem("token", token);
    localStorage.setItem("data", data);
  }

  static isUserAuthenticated() {
    return localStorage.getItem("token") !== null;
  }

  static deauthenticateUser() {
    localStorage.removeItem("token");
    localStorage.removeItem("data");
  }

  static getToken() {
    return localStorage.getItem("token");
  }

  static getData() {
    return localStorage.getItem("data");
  }

  static getLoginName() {
    return localStorage.getItem("data").split(";")[0];
  }  

  static canSeeReports() {
    return localStorage.getItem("data").includes("CanSeeReports");
  }  
}

export default Auth;
