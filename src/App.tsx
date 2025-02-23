import Wrapper from './view/Wrapper';
import Layout from './view/Layout';
import Sidebar from './view/Sidebar';
import Main from './view/Main';
import useChats from './hooks/useChats';

function App() {
  const {
    chatsInfo,
    activeChat,
    isGeneratingAnswer,
    newChat,
    selectChat,
    sendMessage,
    clearChats,
    exportChats,
    importChats,
    updateSelectModel,
    selectedModel,
  } = useChats();

  return (
    <Wrapper>
      <Layout>
        <Sidebar
          chatsInfo={chatsInfo}
          newChat={newChat}
          selectChat={selectChat}
          chatIsSelected={!!activeChat}
          clearChats={clearChats}
          exportChats={exportChats}
          importChats={importChats}
        />
        <Main
          activeChat={activeChat}
          sendMessage={sendMessage}
          isGeneratingAnswer={isGeneratingAnswer}
          isLoading={false}
          updateSelectModel={updateSelectModel}
          selectedModel={selectedModel}
        />
      </Layout>
    </Wrapper>
  );
}

export default App;
