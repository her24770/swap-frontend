import LoginForm from "../../components/auth/LoginForm/LoginForm";
import "./LoginPage.css";

export default function Page() {
  return (
    <div
      className="login-page"
      style={{ backgroundImage: "url('/images/uvg.jpg')" }}
    >
      <div className="login-page__content">
        <LoginForm />
      </div>
    </div>
  );
}