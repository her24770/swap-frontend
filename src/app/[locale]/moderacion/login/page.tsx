import LoginModeradorForm from "../../../../components/auth/LoginModeradorForm/LoginModeradorForm";
import "./ModeracionLoginPage.css";

export default function Page() {
  return (
    <div className="moderacion-login-page">
      <div className="moderacion-login-page__content">
        <LoginModeradorForm />
      </div>
    </div>
  );
}
