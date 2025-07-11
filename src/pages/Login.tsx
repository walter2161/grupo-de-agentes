
import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PasswordInput } from '@/components/PasswordInput';
import { useAuth } from '@/contexts/AuthContext';
import { Mail, User, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

export const Login: React.FC = () => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState('');
  const { login, register } = useAuth();

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

  // Imagem e mensagem estáticas baseadas no dia
  const dailyContent = useMemo(() => {
    const backgroundImages = [
      'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=1200&fit=crop&crop=faces',
      'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=800&h=1200&fit=crop&crop=faces',
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&h=1200&fit=crop&crop=faces',
      'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&h=1200&fit=crop&crop=faces'
    ];

    const motivationalMessages = [
      "Conecte-se com amigos inteligentes através da tecnologia do Chathy! 🤖✨",
      "A amizade é mais forte quando compartilhamos conhecimento e diversão! 🚀💙",
      "Descubra novas conversas e crie vínculos únicos com nossos agentes! 🌟💫",
      "Tecnologia que aproxima corações e mentes em cada chat! 💝🧠",
      "Sua próxima amizade digital está a um clique de distância! 🔮🤝",
      "Juntos, humanos e IA, construímos um mundo mais conectado! 🌍💖",
      "Chathy torna cada conversa uma nova aventura de amizade! 🎮🌈"
    ];

    // Usa o dia do ano para ter uma imagem/mensagem consistente por dia
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    
    return {
      image: backgroundImages[dayOfYear % backgroundImages.length],
      message: motivationalMessages[dayOfYear % motivationalMessages.length]
    };
  }, []);

  return (
    <div className="min-h-screen flex">
      {/* Coluna da imagem */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${dailyContent.image})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/80 to-teal-600/80" />
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
                : 'Preencha os dados para se cadastrar'
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
                    <label className="text-sm font-medium text-gray-700">Nome completo</label>
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
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-700">Termos de Uso</label>
                    <RadioGroup value={termsAccepted} onValueChange={setTermsAccepted}>
                      <div className="flex items-start space-x-2">
                        <RadioGroupItem value="accepted" id="terms" className="mt-1" />
                        <label htmlFor="terms" className="text-sm text-gray-600 leading-relaxed">
                          Aceito os{' '}
                          <Dialog>
                            <DialogTrigger asChild>
                              <button type="button" className="text-blue-600 hover:text-blue-700 underline font-medium">
                                Termos de Uso e Política de Privacidade do Chathy
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
                                  Termos de Uso e Política de Privacidade - Chathy
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
                          </Dialog>
                          {' '}e entendo que sou responsável por todas as minhas criações e interações na plataforma.
                        </label>
                      </div>
                    </RadioGroup>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full h-12 text-base font-medium bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
                  disabled={loading}
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
