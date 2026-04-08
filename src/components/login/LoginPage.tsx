import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <div
      className="min-h-screen w-full bg-cover bg-center bg-no-repeat flex flex-col"
      style={{ backgroundImage: "url('/images/uvg.jpg')" }}
    >
      {/* Navbar */}
      <header className="py-3 bg-[#006b2d] flex items-center px-6 shrink-0">
        <span className="text-white font-bold text-3xl tracking-wide">SWAP</span>
      </header>

      <div className="flex flex-1 items-center justify-center px-4">
        <LoginForm />
      </div>
    </div>
  );
}