import Wrapper from './view/Wrapper';
import Layout from './view/Layout';
import Sidebar from './view/Sidebar';
import Main from './view/Main';
import useChats from './hooks/useChats';
import Notification from './components/Notification';

function App() {
  const {
    chatsInfo,
    activeChat,
    isGeneratingAnswer,
    selectedModel,
    models,
    newChat,
    selectChat,
    sendMessage,
    clearChats,
    exportChats,
    importChats,
    updateSelectModel,
    deleteChat,
    editChatName,
    regenerate,
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
          deleteChat={deleteChat}
          editChatName={editChatName}
        />
        <Main
          activeChat={activeChat}
          sendMessage={sendMessage}
          isGeneratingAnswer={isGeneratingAnswer}
          isLoading={false}
          updateSelectModel={updateSelectModel}
          selectedModel={selectedModel}
          models={models.current}
          regenerate={regenerate}
        />
      </Layout>
      <Notification />
    </Wrapper>
  );
}

export default App;
