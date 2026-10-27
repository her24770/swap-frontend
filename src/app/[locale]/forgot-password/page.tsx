import Image from "next/image";
import ForgotPasswordForm from "../../../components/auth/ForgotPasswordForm/ForgotPasswordForm";
import "../login/LoginPage.css";
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
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
