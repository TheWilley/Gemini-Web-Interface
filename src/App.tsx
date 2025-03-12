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
    totalTokenCount,
    options,
    isLoading,
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
    updateOption,
    cloneChat,
    restoreOptions,
    editMessage,
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
          cloneChat={cloneChat}
          totalTokenCount={totalTokenCount}
        />
        <Main
          activeChat={activeChat}
          sendMessage={sendMessage}
          isGeneratingAnswer={isGeneratingAnswer}
          isLoading={isLoading}
          updateSelectModel={updateSelectModel}
          selectedModel={selectedModel}
          models={models.current}
          regenerate={regenerate}
          viewOptions={viewOptions}
          options={options}
          updateOption={updateOption}
          restoreOptions={restoreOptions}
          editMessage={editMessage}
          cloneChat={cloneChat}
        />
      </Layout>
      <Notification />
    </Wrapper>
  );
}

export default App;
