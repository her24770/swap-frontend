import RegistroForm from "../../../components/auth/RegistroForm/RegistroForm";
import { useTranslations } from 'next-intl';
import { ArrowLeft} from "lucide-react"
import Link from "next/link";
import "./RegistroPage.css";

export default function Page() {
  const t = useTranslations('registro.page');

  return (
    <div className="registro-page">
      <div className="registro-page__content">
        <div className="registro-page__main-container">
          <Link href="/login" className="registro-link" aria-label="Ir a login">
          <ArrowLeft className="registro__arrow"/>
          </Link>
          <div className="registro-page__wrapper">
            <div className="registro-page__text">
              <h1 className="registro-page__title">{t('title')}</h1>
              <p className="registro-page__description">
                {t('description1')}
              </p>
              <p className="registro-page__description">
                {t('description2')}
              </p>
            </div>

            <div className="registro-page__form">
              <RegistroForm />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}