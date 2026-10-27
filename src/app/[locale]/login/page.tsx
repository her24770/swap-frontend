import Image from "next/image";
import LoginForm from "../../../components/auth/LoginForm/LoginForm";
import "./LoginPage.css";
import bgImage from "../../../../public/images/uvg.jpg";

export default function Page() {
  return (
    <div className="login-page">
      <Image
        src={bgImage}
        alt=""
        fill
        preload
        className="login-page__background"
      />
      <div className="login-page__content">
        <LoginForm />
      </div>
    </div>
  );
}
