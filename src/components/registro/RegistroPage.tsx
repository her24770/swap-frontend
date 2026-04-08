import RegisterForm from "./RegistroForm";

export default function RegistroPage() {
  return (
    <div className="min-h-screen w-full flex flex-col bg-white">
      {/* Navbar */}
      <header className="py-3 bg-[#006b2d] flex items-center px-6 shrink-0">
        <span className="text-white font-bold text-3xl tracking-wide">SWAP</span>
      </header>

      {/* Contenido:
          flex-col para moviles
          flex-row para desktop */}
      <div className="flex flex-1 items-center justify-center px-6 py-10">
        <div className="w-full max-w-4xl flex flex-col md:flex-row md:items-center gap-10 md:gap-16">

          {/* Texto*/}
          <div className="flex flex-col gap-5 md:flex-1">
            <h1 className="text-2xl font-bold text-gray-900">
              Crea una cuenta en SWAP
            </h1>
            <a href="#" className="text-600 text-sm leading-relaxed">
              Regístrate con tu correo de la Universidad del Valle de Guatemala.
            </a>
            <a href="#" className="text-600 text-sm leading-relaxed">
              Entérate de todos los productos y servicios que brindan los estudiantes dentro de la Universidad.
            </a>
          </div>

          {/* Formulario */}
          <div className="w-full md:flex-1">
            <RegisterForm />
          </div>

        </div>
      </div>
    </div>
  );
}