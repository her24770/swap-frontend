import RegistroForm from "../../components/auth/RegistroForm/RegistroForm";
import "./RegistroPage.css";

export default function Page() {
  return (
    <div className="registro-page">
      <div className="registro-page__content">
        <div className="registro-page__wrapper">

          <div className="registro-page__text">
            <h1 className="registro-page__title">Crea una cuenta en SWAP</h1>
            <p className="registro-page__description">
              Regístrate con tu correo de la Universidad del Valle de Guatemala.
            </p>
            <p className="registro-page__description">
              Entérate de todos los productos y servicios que brindan los estudiantes dentro de la Universidad.
            </p>
          </div>

          <div className="registro-page__form">
            <RegistroForm />
          </div>

        </div>
      </div>
    </div>
  );
}