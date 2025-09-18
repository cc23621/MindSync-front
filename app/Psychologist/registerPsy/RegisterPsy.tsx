import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Image, StyleSheet, Text, View, TouchableOpacity } from "react-native";
import Button from "../../../components/Button";
import Inputs from "../../../components/Inputs";
import api from "../../../service/api";

export default function RegisterPsy() {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [crp, setCrp] = useState("");

  const handleCadastro = async () => {
    if (!nome || !email || !senha || !crp) {
      Alert.alert("Erro", "Preencha todos os campos.");
      return;
    }

    try {
      await api.post("/auth/register", {
        nome,
        email,
        password: senha,
        crp, 
      });

      Alert.prompt(
        "Verificação de E-mail",
        "Digite o código que você recebeu:",
        async (otp) => {
          try {
            await api.post("/auth/verify-otp", {
              nome,
              email,
              otp,
            });

            Alert.alert("Sucesso", "Conta verificada com sucesso!");
            router.push("../../Patient/login/Login");
          } catch {
            Alert.alert("Erro", "Código inválido. Tente novamente.");
          }
        }
      );
    } catch {
      Alert.alert("Erro", "Erro ao cadastrar. Tente novamente.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Image source={require("../../../assets/icons/arrow.png")} style={styles.back} />
        </TouchableOpacity>
        <View style={styles.titleRow}>
          <Text style={styles.textHeader}>Criar uma{"\n"}conta</Text>
          <Image source={require("../../../assets/icons/logo.png")} style={styles.logo} />
        </View>
        <Text style={styles.text}>
          Você já possui uma conta?{" "}
          <Text style={styles.loginText} onPress={() => router.push("../../Patient/login/Login")}>
            Login
          </Text>
        </Text>
      </View>

      <View style={styles.formContainer}>
        <View style={styles.innerForm}>
          <Inputs placeholder="Nome completo" value={nome} onChangeText={setNome} />
          <Inputs placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
          <Inputs placeholder="Senha" value={senha} onChangeText={setSenha} secureTextEntry />
          <Inputs placeholder="CRP (registro profissional)" value={crp} onChangeText={setCrp} />
          <Button titulo="Cadastrar" onPress={handleCadastro} />
        </View>
        <Image
          source={require("../../../assets/images/registerPsyImage.png")}
          style={styles.imagem}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    backgroundColor: "#000A74", 
    flex: 1, 
    paddingTop: 40 
  },
  header: { 
    paddingHorizontal: 20 
  },
  back: { 
    width: 20, 
    height: 10, 
    marginBottom: 20 
  },
  titleRow: { 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "space-between", 
    marginBottom: 8 
  },
  textHeader: { 
    fontSize: 36, 
    fontWeight: "400", 
    color: "#fff" 
  },
  logo: { 
    width: 70, 
    height: 80 
  },
  text: { 
    fontSize: 14, 
    color: "#fff", 
    marginTop: 15, 
    marginBottom: 30 
  },
  loginText: { 
    color: "#52FFB8", 
    fontWeight: "bold" 
  },
  formContainer: { 
    backgroundColor: "#41BECE", 
    flex: 1,
    borderTopLeftRadius: 40, 
    borderTopRightRadius: 40, 
    justifyContent: "flex-start" },
    innerForm: { padding: 20, marginTop: 30 

  },
  imagem: { 
    width: "100%", 
    height: 250, 
    marginTop: -10, 
    alignSelf: "center", 
    resizeMode: "contain" 
  },
});
