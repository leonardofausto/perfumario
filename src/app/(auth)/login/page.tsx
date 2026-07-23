import Link from "next/link";

export default function LoginPage() {
  return (
    <form aria-label="Entrar na sua estante" className="auth-placeholder-form">
      <p className="form-eyebrow">Bem-vindo de volta</p>
      <h2>Entre na sua estante</h2>
      <p className="form-intro">Use o e-mail do seu convite para continuar.</p>
      <label htmlFor="email">E-mail</label>
      <input autoComplete="email" id="email" name="email" placeholder="seu@email.com" type="email" />
      <label htmlFor="password">Senha</label>
      <input autoComplete="current-password" id="password" name="password" type="password" />
      <Link href="/recuperar-senha">Esqueci minha senha</Link>
      <button type="submit">Entrar</button>
      <small>Acesso privado por convite</small>
    </form>
  );
}
