import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
  TouchableWithoutFeedback,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../../../service/api"; // ajuste o caminho para seu axios

export default function Home() {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const slideAnim = new Animated.Value(-250);

  useEffect(() => {
    const carregarUsuario = async () => {
      try {
        const nome = await AsyncStorage.getItem("userName");
        const id = await AsyncStorage.getItem("userId");
        if (nome) setUserName(nome);
        if (id) setUserId(id);
      } catch (err) {
        console.error("Erro ao carregar usuário:", err);
      }
    };
    carregarUsuario();
  }, []);

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
    Animated.timing(slideAnim, {
      toValue: menuVisible ? -250 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.clear();
      router.replace("/onboarding/Onboarding");
    } catch (err) {
      console.error("Erro ao fazer logout:", err);
    }
  };

  const reacoesInfo: Record<string, { label: string; cor: string; imagem: any }> = {
    alegre: { label: "Alegre", cor: "#FFD700", imagem: require("../../../assets/emojis/alegre.png") },
    feliz: { label: "Feliz", cor: "#90EE90", imagem: require("../../../assets/emojis/feliz.png") },
    indiferente: { label: "Indiferente", cor: "#C0C0C0", imagem: require("../../../assets/emojis/indiferente.png") },
    triste: { label: "Triste", cor: "#87CEEB", imagem: require("../../../assets/emojis/triste.png") },
    raiva: { label: "Raiva", cor: "#FF6347", imagem: require("../../../assets/emojis/raiva.png") },
  };

  const handleReacao = async (tipo: string) => {
    if (!userId) {
      console.error("Usuário não encontrado.");
      return;
    }
  
    try {
      await api.post("/emotion", {
        userId: parseInt(userId, 10), // Certifique-se de enviar o ID como número
        type: tipo,
        count: 1,
        date: new Date().toISOString(), // Envia a data no formato ISO
      });
  
      Alert.alert("Sucesso", "Reação registrada!");
    } catch (err) {
      console.error("Erro ao registrar reação:", err);
      Alert.alert("Erro", "Não foi possível registrar a reação.");
    }
  };

  return (
    <View style={styles.container}>
      {/* Header com botão de menu */}
      <View style={styles.header}>
        <TouchableOpacity onPress={toggleMenu}>
          <Image source={require("../../../assets/icons/menu.png")} style={styles.menuIcon} />
        </TouchableOpacity>
      </View>

      <Text style={styles.greeting}>Olá, {userName || "Usuário"}!</Text>
      <Text style={styles.question}>Como você está se sentindo hoje?</Text>

      {/* Retângulo com emojis clicáveis */}
      <View style={styles.emojiBox}>
        {Object.keys(reacoesInfo).map(tipo => (
          <TouchableOpacity key={tipo} onPress={() => handleReacao(tipo)}>
            <Image source={reacoesInfo[tipo].imagem} style={styles.emoji} />
          </TouchableOpacity>
        ))}
      </View>

      {/* Texto "O que você deseja explorar?" */}
      <Text style={styles.exploreText}>O que você deseja explorar?</Text>

      {/* Grid de imagens estilo quebra-cabeça */}
      <View style={styles.exploreGrid}>
        <View style={styles.row}>
          <Image source={require("../../../assets/explore/img1.png")} style={styles.extraLargeImage} />
          <Image source={require("../../../assets/explore/img2.png")} style={styles.squareImage} />
        </View>
        <View style={styles.row}>
          <Image source={require("../../../assets/explore/img4.png")} style={styles.squareImage} />
          <TouchableOpacity onPress={() => router.push("../graphic/Graphic")}>
            <Image source={require("../../../assets/explore/img3.png")} style={styles.extraLargeImagePuzzle} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Menu lateral */}
      {menuVisible && (
        <TouchableWithoutFeedback onPress={toggleMenu}>
          <View style={styles.overlay}>
            <Animated.View style={[styles.sideMenu, { left: slideAnim }]}>
              <TouchableOpacity onPress={toggleMenu}>
                <Text style={styles.closeBtn}>✖</Text>
              </TouchableOpacity>
              <Text style={styles.menuTitle}>Menu</Text>

              <TouchableOpacity onPress={handleLogout}>
                <Text style={styles.logout}>Logout</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </TouchableWithoutFeedback>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 40, backgroundColor: "#fff" },
  header: { paddingLeft: 20, paddingBottom: 10 },
  menuIcon: { width: 28, height: 28 },
  greeting: { fontSize: 22, fontWeight: "bold", paddingLeft: 20, paddingTop: 40 },
  question: { fontSize: 18, paddingLeft: 20, paddingTop: 20, color: "#333" },

  // Retângulo com emojis
  emojiBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "rgba(145, 102, 255, 0.12)",
    marginHorizontal: 20,
    marginTop: 20,
    padding: 15,
    borderRadius: 12,
  },
  emoji: {
    width: 40,
    height: 40,
  },

  exploreText: { fontSize: 18, paddingLeft: 20, paddingTop: 55, color: "#333" },

  exploreGrid: { marginHorizontal: 20, marginTop: 20 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  extraLargeImage: { flex: 1.1, height: 220, borderRadius: 8, resizeMode: "cover", marginRight: 5, marginLeft: 5 },
  extraLargeImagePuzzle: { flex: 1.3, height: 190, borderRadius: 8, resizeMode: "cover", marginLeft: 5, marginTop: -38 },
  squareImage: { flex: 1, height: 180, borderRadius: 8, resizeMode: "cover", marginLeft: -5 },

  overlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.3)" },
  sideMenu: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 250,
    backgroundColor: "#f9f9f9",
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  closeBtn: { fontSize: 20, alignSelf: "flex-end", marginBottom: 20 },
  menuTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 20 },
  logout: { color: "red", fontWeight: "bold", fontSize: 18, marginTop: 20 },
});
