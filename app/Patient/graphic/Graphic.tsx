import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { LineChart, PieChart } from "react-native-chart-kit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../../../service/api"; // ajuste o caminho para seu axios

const width = Dimensions.get("window").width - 30;

const meses = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

type ReacaoTipo = "alegre" | "feliz" | "indiferente" | "triste" | "raiva";

const reacoesInfo: Record<ReacaoTipo, { label: string; cor: string; imagem: any }> = {
  alegre: { label: "Alegre", cor: "#FFD700", imagem: require("../../../assets/emojis/alegre.png") },
  feliz: { label: "Feliz", cor: "#90EE90", imagem: require("../../../assets/emojis/feliz.png") },
  indiferente: { label: "Indiferente", cor: "#C0C0C0", imagem: require("../../../assets/emojis/indiferente.png") },
  triste: { label: "Triste", cor: "#87CEEB", imagem: require("../../../assets/emojis/triste.png") },
  raiva: { label: "Raiva", cor: "#FF6347", imagem: require("../../../assets/emojis/raiva.png") },
};

export default function Graphic() {
  const router = useRouter();
  const today = new Date();
  const [currentMonthIndex, setCurrentMonthIndex] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [dadosMes, setDadosMes] = useState<Record<string, Record<ReacaoTipo, number>>>({});

  const tipos = Object.keys(reacoesInfo) as ReacaoTipo[];

  const carregarReacoes = async () => {
    try {
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) return;
  
      const res = await api.get("/emotion", {
        params: { userId, month: currentMonthIndex + 1, year: currentYear },
      });
  
      const dadosFormatados: Record<string, Record<ReacaoTipo, number>> = {};
      res.data.forEach((item: any) => {
        const dataStr = new Date(item.date).toISOString().split("T")[0];
        if (!dadosFormatados[dataStr]) dadosFormatados[dataStr] = {} as Record<ReacaoTipo, number>;
        dadosFormatados[dataStr][item.type as ReacaoTipo] = parseInt(item.total, 10);
      });
  
      setDadosMes(dadosFormatados);
    } catch (err) {
      console.error("Erro ao carregar reações:", err);
    }
  };

  useEffect(() => {
    carregarReacoes();
  }, [currentMonthIndex, currentYear]);

  const monthLabel = `${meses[currentMonthIndex]} ${currentYear}`;

  const handlePreviousMonth = () => {
    if (currentMonthIndex === 0) {
      setCurrentMonthIndex(11);
      setCurrentYear(prev => prev - 1);
    } else setCurrentMonthIndex(prev => prev - 1);
  };

  const handleNextMonth = () => {
    if (currentMonthIndex === 11) {
      setCurrentMonthIndex(0);
      setCurrentYear(prev => prev + 1);
    } else setCurrentMonthIndex(prev => prev + 1);
  };

  const totalPorTipo: Record<ReacaoTipo, number> = tipos.reduce((acc, tipo) => {
    acc[tipo] = 0;
    return acc;
  }, {} as Record<ReacaoTipo, number>);

  Object.values(dadosMes).forEach(v => {
    tipos.forEach(tipo => {
      totalPorTipo[tipo] += v[tipo] || 0;
    });
  });

  const dadosPizza = tipos.map(tipo => ({
    name: tipo,
    count: totalPorTipo[tipo],
    color: reacoesInfo[tipo].cor,
    legendFontColor: "#000",
    legendFontSize: 12,
  }));

  const totalReacoes = Object.values(totalPorTipo).reduce((a, b) => a + b, 0);
  const datasOrdenadas = Object.keys(dadosMes).sort();
  const labelsLinha = datasOrdenadas.map(d => d.slice(8)) || [];
  const dadosLinha = datasOrdenadas.map(d => {
    const dia = dadosMes[d] || {};
    return tipos.reduce((soma, tipo) => soma + (dia[tipo] || 0), 0);
  });

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.leftButton}>
          <Image source={require("../../../assets/icons/back.png")} style={styles.icon} />
        </TouchableOpacity>

        <View style={styles.monthContainer}>
          <TouchableOpacity onPress={handlePreviousMonth}>
            <Image source={require("../../../assets/icons/arrow-left.png")} style={styles.arrowIcon} />
          </TouchableOpacity>
          <Text style={styles.monthText}>{monthLabel}</Text>
          <TouchableOpacity onPress={handleNextMonth}>
            <Image source={require("../../../assets/icons/arrow-right.png")} style={styles.arrowIcon} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => console.log("Menu pressionado")} style={styles.rightButton}>
          <Image source={require("../../../assets/icons/menu.png")} style={styles.icon} />
        </TouchableOpacity>
      </View>

      {/* Gráfico de linhas */}
      <View style={styles.graficoContainer}>
        <Text style={styles.graficoTitulo}>Gráfico de humor mensal</Text>
        {dadosLinha.length > 0 ? (
          <LineChart
            data={{ labels: labelsLinha, datasets: [{ data: dadosLinha }] }}
            width={width - 20}
            height={220}
            chartConfig={{
              backgroundGradientFrom: "#fff",
              backgroundGradientTo: "#fff",
              color: () => "#000",
              labelColor: () => "#000",
              propsForDots: { r: "4", strokeWidth: "2", stroke: "#ffa726" },
            }}
            bezier
            style={{ borderRadius: 12 }}
          />
        ) : (
          <Text>Nenhuma reação registrada neste mês.</Text>
        )}
      </View>

      {/* Gráfico de pizza */}
      <Text style={styles.graficoTitulo}>Distribuição de Reações</Text>
      <View style={{ alignItems: "center", marginBottom: 30 }}>
        {totalReacoes > 0 ? (
          <PieChart
            data={dadosPizza}
            width={width}
            height={220}
            accessor={"count"}
            backgroundColor={"transparent"}
            paddingLeft={"15"}
            chartConfig={{ color: () => "#000" }}
            center={[0, 0]}
            hasLegend={true}
          />
        ) : (
          <Text>Nenhuma reação registrada neste mês.</Text>
        )}
        <Text style={{ position: "absolute", top: 100, fontWeight: "bold", fontSize: 16 }}>
          {totalReacoes}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingTop: 40, paddingHorizontal: 15 },
  header: { justifyContent: "center", alignItems: "center", height: 60, marginBottom: 20, position: "relative" },
  leftButton: { position: "absolute", top: -20, left: 0, padding: 8 },
  rightButton: { position: "absolute", top: -20, right: 0, padding: 8 },
  icon: { width: 24, height: 24, resizeMode: "contain" },
  monthContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#C2BDBD",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  monthText: { fontSize: 16, fontWeight: "bold", color: "#000", marginHorizontal: 10 },
  arrowIcon: { width: 16, height: 16, tintColor: "#000", resizeMode: "contain" },
  graficoTitulo: { fontSize: 16, marginBottom: 30, alignSelf: "flex-start", color: "#A1A1A1" },
  graficoContainer: { borderWidth: 1, borderColor: "#E6E6E6", borderRadius: 12, padding: 20, marginTop: 20 },
});
