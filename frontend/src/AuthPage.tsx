import { useEffect, useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, CircleHelp, Eye, EyeOff, ShieldCheck } from 'lucide-react'
import { submitAuth } from './services/api'

export function AuthPage() {
  const location = useLocation()
  const isRegister = location.pathname === '/cadastro'
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    document.title = `${isRegister ? 'Criar conta' : 'Entrar'} — Finanças`
    let robots = document.querySelector('meta[name="robots"]')
    if (!robots) { robots = document.createElement('meta'); robots.setAttribute('name', 'robots'); document.head.appendChild(robots) }
    robots.setAttribute('content', 'noindex, nofollow')
  }, [isRegister])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      await submitAuth(isRegister ? 'register' : 'login', { ...(isRegister ? { name } : {}), email, password })
      navigate('/dashboard')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível acessar sua conta.')
    } finally { setLoading(false) }
  }

  return <main className="auth-page"><div className="auth-backdrop"></div><div className="auth-top"><Link to="/" className="brand"><span className="brand-mark"><CircleHelp size={18} /></span><span>finanças<span className="brand-period">.</span></span></Link><Link to="/" className="auth-home"><ArrowLeft size={15} /> Voltar ao início</Link></div><section className="auth-card"><span className="auth-icon"><ShieldCheck size={21} /></span><span className="eyebrow">SUA VIDA FINANCEIRA, COM CLAREZA</span><h1>{isRegister ? 'Crie sua conta.' : 'Que bom ver você.'}</h1><p>{isRegister ? 'Comece a organizar suas informações financeiras com segurança.' : 'Entre para continuar acompanhando suas informações.'}</p><form onSubmit={handleSubmit}>
      {isRegister && <label>Nome completo<input type="text" autoComplete="name" minLength={2} maxLength={80} value={name} onChange={event => setName(event.target.value)} required /></label>}
      <label>E-mail<input type="email" autoComplete="email" maxLength={254} value={email} onChange={event => setEmail(event.target.value)} required /></label>
      <label>Senha<span className="auth-password"><input type={showPassword ? 'text' : 'password'} autoComplete={isRegister ? 'new-password' : 'current-password'} minLength={isRegister ? 10 : 1} maxLength={128} value={password} onChange={event => setPassword(event.target.value)} required /><button type="button" aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'} onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></span>{isRegister && <small className="field-hint">Use pelo menos 10 caracteres.</small>}</label>
      {error && <div className="auth-error" role="alert">{error}</div>}
      <button className="button button-dark auth-submit" disabled={loading}>{loading ? 'Aguarde…' : isRegister ? 'Criar minha conta' : 'Entrar'} <ArrowRight size={16} /></button>
    </form><div className="auth-switch">{isRegister ? 'Já tem uma conta?' : 'Ainda não tem uma conta?'} <Link to={isRegister ? '/login' : '/cadastro'}>{isRegister ? 'Entrar' : 'Criar conta'}</Link></div><div className="auth-privacy"><ShieldCheck size={15} /><span>Seus dados financeiros são privados. A plataforma não acessa sua conta bancária.</span></div></section><footer className="auth-footer">Conteúdo informativo e educacional. Não é recomendação de investimento.</footer></main>
}
