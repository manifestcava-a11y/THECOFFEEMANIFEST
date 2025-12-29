import { Link, useParams } from "react-router-dom";

export default function ErrorPage({ code: codeProp, message }: { code?: string | number; message?: string }) {
  const params = useParams();
  const code = String(codeProp ?? params.code ?? "Error");

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#361c0c' }}>
      <div className="text-center px-6">
        <h1 className="font-black tracking-wider" style={{ color: '#ffffff', fontSize: '18rem', lineHeight: 1 }}>{code}</h1>
        {message && <p className="text-white/90 text-xl mb-8">{message}</p>}
        <Link to="/" className="inline-block px-6 py-3 border-2 font-black hover:bg-white hover:text-[#361c0c] transition-all duration-300" style={{ color: '#ffffff', borderColor: '#ffffff' }}>
          На головну
        </Link>
      </div>
    </div>
  );
}









