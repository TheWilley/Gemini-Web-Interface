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
    viewOptions,
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
    toggleViewOptions,
  } = useChats();

  return (
    <Wrapper>
      <Layout>
        <Sidebar
          chatsInfo={chatsInfo}
          newChat={newChat}
          selectChat={selectChat}
          chatIsSelected={!!activeChat || viewOptions}
          clearChats={clearChats}
          exportChats={exportChats}
          importChats={importChats}
          deleteChat={deleteChat}
          editChatName={editChatName}
          toggleViewOptions={toggleViewOptions}
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
          viewOptions={viewOptions}
        />
      </Layout>
      <Notification />
    </Wrapper>
  );
}

export default App;
