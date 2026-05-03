import LoginForm from "../../../components/auth/LoginForm/LoginForm";
import "./LoginPage.css";
import bgImage from "../../../public/images/uvg.jpg";

export default function Page() {
  const bgStyle = {
    "--bg-image": `url('${bgImage.src}')`,
  } as React.CSSProperties;

  return (
    <div className="login-page" style={bgStyle}>
      <div className="login-page__content">
        <LoginForm />
      </div>
    </div>
  );
}