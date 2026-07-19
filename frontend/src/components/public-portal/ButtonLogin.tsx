import { User } from "lucide-react";


export function ButtonLogin() {
    return (
        <a className="grid h-11 w-11 place-items-center rounded-full bg-red-600  text-white transition hover:bg-red-700" href="login"
         aria-label="Iniciar sesión">
            <User size={18} />
        </a>
    );
}