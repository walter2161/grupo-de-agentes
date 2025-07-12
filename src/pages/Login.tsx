
import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PasswordInput } from '@/components/PasswordInput';
import { useAuth } from '@/contexts/AuthContext';
import { Mail, User, ExternalLink, RefreshCcw } from 'lucide-react';
import { toast } from 'sonner';

export const Login: React.FC = () => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [captchaQuestion, setCaptchaQuestion] = useState({ question: '', answer: 0 });
  const { login, register } = useAuth();

  // Gera pergunta matemática simples para captcha
  const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    const operations = ['+', '-'];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    
    const question = `${num1} ${operation} ${num2}`;
    const answer = operation === '+' ? num1 + num2 : num1 - num2;
    
    return { question, answer };
  };

  const refreshCaptcha = () => {
    setCaptchaQuestion(generateCaptcha());
    setCaptchaAnswer('');
  };

  // Atualiza captcha quando muda para cadastro
  React.useEffect(() => {
    if (!isLoginMode) {
      setCaptchaQuestion(generateCaptcha());
      setCaptchaAnswer('');
    }
  }, [isLoginMode]);

  // Verifica se todos os campos estão preenchidos para habilitar o botão
  const isFormValid = useMemo(() => {
    if (isLoginMode) {
      return email.trim() && password.length === 6;
    } else {
      return email.trim() && 
             name.trim() && 
             password.length === 6 && 
             termsAccepted && 
             parseInt(captchaAnswer) === captchaQuestion.answer;
    }
  }, [isLoginMode, email, name, password, termsAccepted, captchaAnswer, captchaQuestion.answer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (password.length !== 6) {
        toast.error('A senha deve conter exatamente 6 números');
        return;
      }

      let success = false;
      
      if (isLoginMode) {
        success = await login(email, password);
        if (!success) {
          toast.error('Email ou senha incorretos');
        }
      } else {
        if (!name.trim()) {
          toast.error('Nome é obrigatório');
          return;
        }
        if (!termsAccepted) {
          toast.error('Você deve aceitar os termos de uso para continuar');
          return;
        }
        if (parseInt(captchaAnswer) !== captchaQuestion.answer) {
          toast.error('Resposta do captcha incorreta. Tente novamente.');
          return;
        }
        success = await register(email, name, password);
        if (!success) {
          toast.error('Este email já está cadastrado');
        } else {
          toast.success('Conta criada com sucesso!');
        }
      }
    } catch (error) {
      toast.error('Erro interno. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Conteúdo estático motivacional
  const dailyContent = {
    message: "Conecte-se com amigos inteligentes através da tecnologia do Chathy! 🤖✨"
  };

  return (
    <div className="min-h-screen flex">
      {/* Coluna da imagem */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-blue-600/80 to-teal-600/80">
        <div className="relative z-10 flex flex-col justify-center items-center p-12 text-white">
          <div className="max-w-md text-center">
            <div className="mb-8">
              <img 
                src="/lovable-uploads/719cf256-e78e-410a-ac5a-2f514a4b8d16.png" 
                alt="Chathy Mascote" 
                className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/20 p-2"
              />
              <h1 className="text-4xl font-bold mb-4">Bem-vindo ao Chathy</h1>
              <p className="text-lg text-white/90 leading-relaxed">
                {dailyContent.message}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Coluna do formulário */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 overflow-hidden">
              <img 
                src="/lovable-uploads/719cf256-e78e-410a-ac5a-2f514a4b8d16.png" 
                alt="Chathy Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              {isLoginMode ? 'Entrar na sua conta' : 'Criar nova conta'}
            </h2>
             <p className="text-gray-600 mt-2">
               {isLoginMode 
                 ? 'Digite suas credenciais para acessar' 
                 : 'Preencha todos os campos obrigatórios (*) para se cadastrar'
               }
             </p>
          </div>

          <Card className="border-0 shadow-lg">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-center text-lg">
                {isLoginMode ? 'Login' : 'Cadastro'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                      required
                      disabled={loading}
                      className="pl-10 h-12"
                    />
                  </div>
                </div>

                {!isLoginMode && (
                   <div className="space-y-2">
                     <label className="text-sm font-medium text-gray-700">
                       Nome completo <span className="text-red-500">*</span>
                     </label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Seu nome completo"
                        required
                        disabled={loading}
                        className="pl-10 h-12"
                      />
                    </div>
                  </div>
                )}

                <PasswordInput
                  value={password}
                  onChange={setPassword}
                  disabled={loading}
                />

                {!isLoginMode && (
                  <>
                     <div className="space-y-2">
                       <label className="text-sm font-medium text-gray-700">
                         Verificação de Segurança <span className="text-red-500">*</span>
                       </label>
                       <div className="p-4 bg-gray-50 rounded-lg border">
                         <div className="flex items-center space-x-3">
                           <div className="text-lg font-mono bg-white px-3 py-2 rounded border flex-shrink-0">
                             {captchaQuestion.question} = ?
                           </div>
                           <Input
                             type="number"
                             value={captchaAnswer}
                             onChange={(e) => setCaptchaAnswer(e.target.value)}
                             placeholder="Resposta"
                             className="w-24"
                             required
                             disabled={loading}
                           />
                           <Button
                             type="button"
                             variant="outline"
                             size="sm"
                             onClick={refreshCaptcha}
                             disabled={loading}
                             className="p-2 h-8 w-8"
                             title="Gerar nova pergunta"
                           >
                             <RefreshCcw className="h-3 w-3" />
                           </Button>
                         </div>
                         <p className="text-xs text-gray-500 mt-2">
                           Resolva esta operação matemática para provar que você não é um robô
                         </p>
                       </div>
                     </div>

                     <div className="space-y-3">
                       <label className="text-sm font-medium text-gray-700">
                         Termos de Uso <span className="text-red-500">*</span>
                       </label>
                      <div className="flex items-start space-x-3">
                        <Checkbox
                          id="terms"
                          checked={termsAccepted}
                          onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                          className="mt-1 flex-shrink-0"
                        />
                        <label htmlFor="terms" className="text-sm text-gray-600 leading-relaxed cursor-pointer text-left">
                          Aceito os <Dialog>
                            <DialogTrigger asChild>
                              <button 
                                type="button" 
                                className="text-blue-600 hover:text-blue-700 underline font-medium inline text-left"
                              >
                                Termos e Políticas do Chathy
                              </button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                  <img 
                                    src="/lovable-uploads/719cf256-e78e-410a-ac5a-2f514a4b8d16.png" 
                                    alt="Chathy" 
                                    className="w-6 h-6"
                                  />
                                  Termos e Políticas - Chathy
                                </DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4 text-sm">
                                <section>
                                  <h3 className="font-semibold text-base mb-2">1. Responsabilidades dos Usuários</h3>
                                  <p>
                                    Ao utilizar o Chathy, você concorda que é inteiramente responsável por todas as criações, 
                                    conteúdos e interações que desenvolver com nossos agentes de IA. Isso inclui, mas não se 
                                    limita a: conversas, textos, ideias, projetos e qualquer output gerado através da plataforma.
                                  </p>
                                </section>
                                
                                <section>
                                  <h3 className="font-semibold text-base mb-2">2. Uso Responsável</h3>
                                  <p>
                                    Você se compromete a usar o Chathy de forma ética e legal, respeitando direitos autorais, 
                                    não criando conteúdo prejudicial, ofensivo ou que viole leis aplicáveis. O Chathy não se 
                                    responsabiliza pelo uso inadequado da plataforma.
                                  </p>
                                </section>

                                <section>
                                  <h3 className="font-semibold text-base mb-2">3. Privacidade e Dados</h3>
                                  <p>
                                    Respeitamos sua privacidade. Os dados são processados localmente sempre que possível. 
                                    Conversas podem ser armazenadas temporariamente para melhorar a experiência, mas não 
                                    compartilhamos informações pessoais com terceiros sem seu consentimento.
                                  </p>
                                  </section>

                                <section>
                                  <h3 className="font-semibold text-base mb-2">4. Limitação de Responsabilidade</h3>
                                  <p>
                                    O Chathy fornece uma plataforma de interação com IA "como está". Não garantimos precisão 
                                    total das respostas dos agentes e não nos responsabilizamos por decisões tomadas com base 
                                    nas interações na plataforma.
                                  </p>
                                </section>

                                <section>
                                  <h3 className="font-semibold text-base mb-2">5. Propriedade Intelectual</h3>
                                  <p>
                                    Você mantém todos os direitos sobre o conteúdo que criar. O Chathy mantém direitos sobre 
                                    sua tecnologia, design e agentes de IA. Ao usar nossos agentes, você tem licença para 
                                    usar os outputs gerados.
                                  </p>
                                </section>

                                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                                  <p className="text-xs text-gray-600">
                                    Última atualização: {new Date().toLocaleDateString('pt-BR')}
                                  </p>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog> e entendo que sou responsável por todas as minhas criações e interações na plataforma.
                        </label>
                      </div>
                    </div>
                  </>
                )}

                <Button
                  type="submit"
                  className="w-full h-12 text-base font-medium bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading || !isFormValid}
                >
                  {loading ? 'Processando...' : (isLoginMode ? 'Entrar' : 'Criar conta')}
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setIsLoginMode(!isLoginMode)}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    disabled={loading}
                  >
                    {isLoginMode 
                      ? 'Não tem conta? Cadastre-se' 
                      : 'Já tem conta? Faça login'
                    }
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;
