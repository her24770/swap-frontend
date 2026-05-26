import ForgotPasswordForm from "../../../components/auth/ForgotPasswordForm/ForgotPasswordForm";
import "../login/LoginPage.css";
import bgImage from "../../../../public/images/uvg.jpg";
import type { CSSProperties } from "react";

export default function Page() {
  const bgStyle = {
    "--bg-image": `url('${bgImage.src}')`,
  } as CSSProperties;

  return (
    <div className="login-page" style={bgStyle}>
      <div className="login-page__content">
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
