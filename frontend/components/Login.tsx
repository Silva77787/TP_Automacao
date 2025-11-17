import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { API_ENDPOINTS } from '@/constants/api';

interface LoginProps {
  visible: boolean;
  onClose: () => void;
}

export function Login({ visible, onClose }: LoginProps) {
  const [isLogin, setIsLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (isLogin) {
      // LOGIN
      setLoading(true);
      try {
        const response = await fetch(API_ENDPOINTS.LOGIN, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier: email, password }),
        });
        const data = await response.json();
        if (response.ok) {
          console.log('Login successful', data);
          Alert.alert('Success', 'Login successful!');
          onClose();
          setEmail('');
          setPassword('');
        } else {
          Alert.alert('Error', data.error || 'Login failed');
        }
      } catch (error) {
        Alert.alert('Error', 'Network error. Try again later.');
      } finally {
        setLoading(false);
      }
    } else {
      // REGISTER
      setLoading(true);
      try {
        const response = await fetch(API_ENDPOINTS.REGISTER, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: name, email, password }),
        });
        const data = await response.json();
        if (response.ok) {
          Alert.alert('Success', 'Account created successfully. You may now log in.');
          setIsLogin(true);
          setName('');
        } else {
          Alert.alert('Error', data.error || 'Registration failed');
        }
      } catch (error) {
        Alert.alert('Error', 'Network error. Try again later.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#11181C" />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <View style={styles.logoContainer}>
              <Ionicons name="film" size={32} color="#030213" />
              <Text style={styles.logoText}>CineHub</Text>
            </View>

            <Text style={styles.title}>
              {isLogin ? 'Bem-vindo de volta' : 'Criar conta'}
            </Text>
            <Text style={styles.subtitle}>
              {isLogin
                ? 'Entre com suas credenciais para continuar'
                : 'Preencha os dados para criar sua conta'}
            </Text>

            {!isLogin && (
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Nome completo</Text>
                <Input
                  placeholder="Seu nome"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              </View>
            )}

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <Input
                placeholder="seu@email.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Senha</Text>
              <Input
                placeholder="••••••••"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            {isLogin && (
              <View style={styles.options}>
                <View style={styles.checkboxContainer}>
                  <Ionicons name="square-outline" size={20} color="#687076" />
                  <Text style={styles.checkboxText}>Lembrar de mim</Text>
                </View>
                <TouchableOpacity>
                  <Text style={styles.linkText}>Esqueceu a senha?</Text>
                </TouchableOpacity>
              </View>
            )}

            <Button
              onPress={handleSubmit}
              size="lg"
              style={styles.submitButton}
              loading={loading}
              disabled={loading}
            >
              {isLogin ? 'Entrar' : 'Criar conta'}
            </Button>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>ou</Text>
              <View style={styles.dividerLine} />
            </View>

            <Button variant="outline" style={styles.googleButton}>
              Continuar com Google
            </Button>

            <View style={styles.switchContainer}>
              <Text style={styles.switchText}>
                {isLogin ? 'Não tem uma conta? ' : 'Já tem uma conta? '}
              </Text>
              <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
                <Text style={styles.switchLink}>
                  {isLogin ? 'Criar conta' : 'Entrar'}
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.terms}>
              Ao criar uma conta, você concorda com nossos{' '}
              <Text style={styles.termsLink}>Termos de Serviço</Text> e{' '}
              <Text style={styles.termsLink}>Política de Privacidade</Text>
            </Text>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 16,
    alignItems: 'flex-end',
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 24,
    paddingTop: 0,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
    alignSelf: 'center',
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#030213',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    color: '#11181C',
  },
  subtitle: {
    fontSize: 14,
    color: '#687076',
    textAlign: 'center',
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    color: '#11181C',
  },
  options: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkboxText: {
    fontSize: 14,
    color: '#687076',
  },
  linkText: {
    fontSize: 14,
    color: '#030213',
    fontWeight: '500',
  },
  submitButton: {
    marginBottom: 16,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#ececf0',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 12,
    color: '#687076',
    textTransform: 'uppercase',
  },
  googleButton: {
    marginBottom: 24,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  switchText: {
    fontSize: 14,
    color: '#687076',
  },
  switchLink: {
    fontSize: 14,
    color: '#030213',
    fontWeight: '500',
  },
  terms: {
    fontSize: 12,
    color: '#687076',
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: {
    color: '#030213',
    fontWeight: '500',
  },
});

