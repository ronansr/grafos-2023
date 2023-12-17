import React, { useEffect, useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Container,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import GraphStructures from "../../class/GraphStrutures";
import Graph from "../../class/Graph";
import Graphviz from "graphviz-react";
import { Title } from "@mui/icons-material";

const menu = [
  { id: 1, name: "Busca em largura" },
  { id: 2, name: "Busca em profundidade" },
  { id: 3, name: "Prim - árvore geradora mínima" },
  { id: 4, name: "Dijkstra - caminho mínimo" },
  { id: 5, name: "Ciclo euleriano" },
  { id: 6, name: "Ordenação topológica" },
];

const AdjacencyMatrixTable = (props: { adjacencyMatrix: any }) => {
  const { adjacencyMatrix } = props;
  return (
    <div>
      <h2>Matriz de Adjacência</h2>
      <table style={{ border: "1px solid black", borderCollapse: "collapse" }}>
        <tbody>
          <tr>
            <td></td>
            {adjacencyMatrix[0].map((_: any, colIndex: any) => (
              <td
                key={colIndex}
                style={{
                  border: "1px solid black",
                  padding: "8px",
                  fontWeight: "bold",
                }}
              >
                {colIndex + 1}
              </td>
            ))}
          </tr>
          {adjacencyMatrix.map((row: any, rowIndex: any) => (
            <tr key={rowIndex}>
              <td
                style={{
                  border: "1px solid black",
                  padding: "8px",
                  fontWeight: "bold",
                }}
              >
                {rowIndex + 1}
              </td>
              {row.map((value: any, colIndex: any) => (
                <td
                  key={colIndex}
                  style={{ border: "1px solid black", padding: "8px" }}
                >
                  {value}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    // <div>
    //   <h2>Matriz de Adjacência</h2>
    //   <table style={{ border: "1px solid black", borderCollapse: "collapse" }}>
    //     <tbody>
    //       {adjacencyMatrix.map((row: any, rowIndex: any) => (
    //         <tr key={rowIndex}>
    //           {row.map((value: any, colIndex: any) => (
    //             <td
    //               key={colIndex}
    //               style={{ border: "1px solid black", padding: "8px" }}
    //             >
    //               {value}
    //             </td>
    //           ))}
    //         </tr>
    //       ))}
    //     </tbody>
    //   </table>
    // </div>
  );
};

const IncidenceMatrixTable = (props: { incidenceMatrix: any }) => {
  const { incidenceMatrix } = props;

  return (
    <div>
      <h2>Matriz de Incidência</h2>
      <table style={{ border: "1px solid black", borderCollapse: "collapse" }}>
        <tbody>
          <tr>
            <td></td>
            {incidenceMatrix[0].map((_: any, colIndex: any) => (
              <td
                key={colIndex}
                style={{
                  border: "1px solid black",
                  padding: "8px",
                  fontWeight: "bold",
                }}
              >
                {colIndex + 1}
              </td>
            ))}
          </tr>
          {incidenceMatrix.map((row: any, rowIndex: any) => (
            <tr key={rowIndex}>
              <td
                style={{
                  border: "1px solid black",
                  padding: "8px",
                  fontWeight: "bold",
                }}
              >
                {rowIndex + 1}
              </td>
              {row.map((value: any, colIndex: any) => (
                <td
                  key={colIndex}
                  style={{ border: "1px solid black", padding: "8px" }}
                >
                  {value}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const IncidenceTable = (props: { data: any }) => {
  const { data } = props;
  const [groupedData, setGroupedData] = useState<
    { node: number; edges: { edge: number; weight: number }[] }[]
  >([]);

  useEffect(() => {
    const grouped = data.reduce((acc: any, currentItem: any) => {
      const existingNode = acc.find(
        (item: any) => item.node === currentItem.node
      );

      if (existingNode) {
        existingNode.edges.push({
          edge: currentItem.edge,
          weight: currentItem.weight,
        });
      } else {
        acc.push({
          node: currentItem.node,
          edges: [{ edge: currentItem.edge, weight: currentItem.weight }],
        });
      }

      return acc;
    }, [] as { node: number; edges: { edge: number; weight: number }[] }[]);

    setGroupedData(grouped);
  }, [data]);

  return (
    <div>
      <h2>Tabela de Incidencia</h2>
      <ul>
        {groupedData.map((item) => (
          <li key={item.node}>
            <strong>Node {item.node}:</strong>
            <ul>
              {item.edges.map((edgeItem) => (
                <li key={edgeItem.edge}>
                  Edge {edgeItem.edge} - Weight: {edgeItem.weight}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
};

function Header() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedOption, setSelectedOption] = useState<{
    id: number;
    name: string;
    onRun: Function;
  }>();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [graphFromFile, setGraphFromFile] = useState<Graph | null>(null);
  const [graphOut, setGraphOut] = useState<Graph | null>(null);
  const [graphOutGraphViz, setGraphOutGraphViz] = useState<string>();
  const [primResult, setPrimResult] = useState<any>();
  const [dijkstraResult, setDijkstraResult] = useState<any>();
  const [showStrutures, setShowStrutures] = useState<boolean>(false);

  const handleMenuClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMenuItemClick = (option: any) => {
    setSelectedOption(option);
    setAnchorEl(null);
    onClick(option?.id);
  };

  const handleRunButtonClick = async () => {
    // Lógica para ação ao clicar no botão de rodar
    console.log("Rodar", selectedFile);

    if (selectedFile) {
      const graph = await GraphStructures.readFileAndCreateGraph(selectedFile);

      console.log("Graph", graph);

      setGraphFromFile(graph);
    }
  };

  const handleFileUpload = () => {
    // Abrir o seletor de arquivo
    const inputElement = document.createElement("input");
    inputElement.type = "file";
    inputElement.addEventListener("change", handleFileSelected);
    inputElement.click();
  };

  const handleFileSelected = (event: any) => {
    const file = event.target.files[0];
    // Atualizar o estado com o arquivo selecionado
    setSelectedFile(file);
    // Lógica para processar o arquivo selecionado, se necessário
    console.log("Arquivo selecionado:", file.name);
  };

  const handleDownloadButtonClick = () => {
    // Lógica para ação ao clicar no botão de baixar
    console.log("Baixar");
  };

  const onClick = (aId: number) => {
    let startNode = null;
    switch (aId) {
      case 1:
        // Busca em Largura
        startNode = prompt("Informe o nó inicial:");

        if (
          startNode &&
          graphFromFile?.order &&
          parseInt(startNode) < graphFromFile?.order
        ) {
          const nodes = graphFromFile?.breadthFirstSearch(parseInt(startNode));

          setGraphOutGraphViz(
            GraphStructures.generateGraphFromNodesArray(nodes)
          );
        }

        break;
      case 2:
        // Busca em Profundidade
        startNode = prompt("Informe o nó inicial:");

        if (
          startNode &&
          graphFromFile?.order &&
          parseInt(startNode) < graphFromFile?.order
        ) {
          const nodes = graphFromFile?.depthFirstSearch(parseInt(startNode));

          setGraphOutGraphViz(
            GraphStructures.generateGraphFromNodesArray(nodes)
          );
        }
        break;
      case 3:
        // Prim - Árvore Geradora Mínima
        setPrimResult(graphFromFile?.agmPrim());
        break;
      case 4:
        // Dijkstra - Caminho Mínimo
        startNode = prompt("Informe o nó inicial:");

        if (
          startNode &&
          graphFromFile?.order &&
          parseInt(startNode) < graphFromFile?.order
        ) {
          setDijkstraResult(graphFromFile.dijkstra(parseInt(startNode) - 1));
        }
        break;
      case 5:
        // Ciclo Euleriano
        let resp = graphFromFile?.eulerianCycle();
        console.log(resp);
        break;
      case 6:
        // Ordenação Topológica
        console.log("Executando Ordenação Topológica");
        if (graphFromFile) {
          const adjcencyMatrix =
            GraphStructures.generateGraphStructures(
              graphFromFile
            )?.adjacencyMatrix;
          console.log(adjcencyMatrix);
        }
        break;
      default:
        console.log("Algoritmo não reconhecido");
    }
  };

  return (
    <Container>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={handleMenuClick}
          >
            <MenuIcon />
          </IconButton>
          {selectedOption && (
            <Typography variant="body1" color="inherit" sx={{ marginLeft: 2 }}>
              {selectedOption?.name}
            </Typography>
          )}
          <Menu
            id="header-menu"
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem
              key={"ansf"}
              onClick={() => setShowStrutures(!showStrutures)}
              disabled={!graphFromFile}
              style={{ borderBottomWidth: 1 }}
            >
              {showStrutures ? "Esconder estruturas" : "Mostrar Estrutura"}
            </MenuItem>
            {menu?.map((item) => (
              <MenuItem
                key={item.id}
                onClick={() => handleMenuItemClick(item)}
                disabled={!graphFromFile}
              >
                {item.name}
              </MenuItem>
            ))}
          </Menu>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Trabalho Grafos
          </Typography>
          <Button
            color="inherit"
            onClick={handleRunButtonClick}
            disabled={!selectedFile}
          >
            Rodar
          </Button>
          <Button color="inherit" onClick={handleFileUpload}>
            {selectedFile ? selectedFile?.name : "Carregar Arquivo"}
          </Button>
          <Button color="inherit" onClick={handleDownloadButtonClick}>
            Baixar
          </Button>
        </Toolbar>
      </AppBar>

      {showStrutures && (
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <AdjacencyMatrixTable
            adjacencyMatrix={
              graphFromFile
                ? GraphStructures?.generateGraphStructures(graphFromFile)
                    ?.adjacencyMatrix
                : null
            }
          />
          <IncidenceMatrixTable
            incidenceMatrix={
              graphFromFile
                ? GraphStructures?.generateGraphStructures(graphFromFile)
                    ?.incidenceMatrix
                : null
            }
          />

          <IncidenceTable
            data={
              graphFromFile
                ? GraphStructures?.generateGraphStructures(graphFromFile)
                    ?.incidenceTable
                : null
            }
          />
        </div>
      )}

      {graphFromFile ? (
        <Graphviz dot={graphFromFile?.graphToGraphviz()} />
      ) : (
        <></>
      )}

      <Container>
        <h3>Sáida gerada por: {selectedOption?.name}</h3>
      </Container>
      {graphOutGraphViz ? <Graphviz dot={graphOutGraphViz} /> : <></>}
      {primResult ? (
        <div>{GraphStructures.formatPrimResult(primResult)}</div>
      ) : (
        <></>
      )}

      {dijkstraResult ? <div>{JSON.stringify(dijkstraResult)}</div> : <></>}
    </Container>
  );
}

export default Header;
