
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { PasswordInput } from '@/components/PasswordInput';
import { useAuth } from '@/contexts/AuthContext';
import { Mail, User, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

export const Login: React.FC = () => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
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

  const backgroundImages = [
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=1200&fit=crop&crop=faces',
    'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=800&h=1200&fit=crop&crop=faces',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&h=1200&fit=crop&crop=faces',
    'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&h=1200&fit=crop&crop=faces'
  ];

  const randomImage = backgroundImages[Math.floor(Math.random() * backgroundImages.length)];

  return (
    <div className="min-h-screen flex">
      {/* Coluna da imagem */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${randomImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/80 to-teal-600/80" />
        <div className="relative z-10 flex flex-col justify-center items-center p-12 text-white">
          <div className="max-w-md text-center">
            <h1 className="text-4xl font-bold mb-6">Bem-vindo ao Chathy</h1>
            <p className="text-xl opacity-90 leading-relaxed">
              Conecte-se com especialistas em IA para todas as suas necessidades. 
              Uma nova forma de interagir com inteligência artificial.
            </p>
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

              {isLoginMode && (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs text-blue-700 font-medium mb-2">Conta padrão para teste:</p>
                  <p className="text-xs text-blue-600">Email: walter@ledmkt.com</p>
                  <p className="text-xs text-blue-600">Senha: 9, 7, 6, 4, 3, 1</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;
