import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Image, StyleSheet, Text, View, TouchableOpacity } from "react-native";
import Button from "../../../components/Button";
import Inputs from "../../../components/Inputs";
import api from "../../../service/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  

  const handleLogin = async () => {
    try {
      const response = await api.post("/auth/login", {
        email,
        password: senha,
      });
  
      const { nome, id } = response.data.user;
  
      // Armazena o nome e o ID do usuário no AsyncStorage
      await AsyncStorage.setItem("userName", nome);
      await AsyncStorage.setItem("userId", id.toString());
  
      Alert.alert("Sucesso", "Login realizado com sucesso!");
      router.push("../home/Home");
    } catch (error) {
      Alert.alert("Erro", "Email ou senha inválidos. Tente novamente.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Image source={require("../../../assets/icons/arrow.png")} style={styles.back} />
        </TouchableOpacity>
        <View style={styles.titleRow}>
          <Text style={styles.textHeader}>Bem-vindo{"\n"}de volta</Text>
          <Image source={require("../../../assets/icons/logo.png")} style={styles.logo} />
        </View>
        <Text style={styles.text}>
          Não possui uma conta?{" "}
          <Text style={styles.registerText} onPress={() => router.push("../register/Register")}>
            Cadastre-se
          </Text>
        </Text>
      </View>
      
      <Image
        source={require("../../../assets/images/loginImage.png")}
        style={styles.imagem}
      />

      <View style={styles.formContainer}>
        <Inputs placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
        <Inputs placeholder="Senha" value={senha} onChangeText={setSenha} secureTextEntry />
        <Button titulo="Entrar" onPress={handleLogin} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000A74",
    justifyContent: "space-between",
    paddingTop: 40,
  },
  header: {
    paddingHorizontal: 20,
  },
  back: {
    width: 20,
    height: 10,
    marginBottom: 20,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between", // Adicionado para posicionar o texto e a logo
    marginBottom: 8,
  },
  textHeader: {
    fontSize: 36,
    fontWeight: "400",
    color: "#fff",
  },
  logo: {
    width: 70,
    height: 80,
  },
  text: {
    fontSize: 14,
    color: "#fff",
    marginTop: 15,
  },
  registerText: {
    color: "#52FFB8",
    fontWeight: "bold",
  },
  formContainer: {
    backgroundColor: "#41BECE",
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    padding: 20,
    paddingBottom: 40,
  },
  imagem: { 
    width: "100%", 
    height: 300, 
    resizeMode: "contain", 
    alignSelf: "center", 
    marginTop: 10, 
    marginBottom: -90, 
    zIndex: 2 },
});