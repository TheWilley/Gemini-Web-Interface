import {
  faHeader,
  faHistory,
  faQuestionCircle,
  faRefresh,
  faThermometer2,
} from '@fortawesome/free-solid-svg-icons';
import Input from '../components/Input';
import Tooltip from '../components/Tooltip';
import { Options } from '../global/types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from '../components/Button';
import IconWithElement from '../components/IconWithText';

function Settings({
  options,
  restoreOptions,
  updateOption,
}: {
  options: Options;
  restoreOptions: () => void;
  updateOption: (target: string, value: string) => void;
}) {
  return (
    <div className='w-96'>
      <h1 className='mb-6 text-xl font-semibold'>Settings</h1>
      <div className='flex items-center gap-3'>
        <Input
          type='number'
          value={options.numRememberPreviousMessages}
          onChange={(e) => updateOption('numRememberPreviousMessages', e.target.value)}
          label='Previous Messages'
          icon={faHistory}
          disabled={false}
          name='previous_messages'
          minValue={0}
        />
        <Tooltip
          position='right'
          text='How many previous messages the AI remembers when generating its next response'
          offsetX={15}
          width={150}
        >
          <FontAwesomeIcon icon={faQuestionCircle} />
        </Tooltip>
      </div>
      <div className='mt-5 flex items-center gap-3'>
        <Input
          type='text'
          value={options.chatNamePrompt}
          onChange={(e) => updateOption('chatNamePrompt', e.target.value)}
          label='Chat Name Prompt'
          icon={faHeader}
          disabled={false}
          name='chat_name_prompt'
        />
        <Tooltip
          position='right'
          text='The prompt that should be used to generate a chat name, [n] is replaced with the first message sent by the AI - leave blank to disable name generation'
          offsetX={15}
          width={150}
        >
          <FontAwesomeIcon icon={faQuestionCircle} />
        </Tooltip>
      </div>
      <div className='mt-5 flex items-center gap-3'>
        <Input
          type='number'
          value={options.temperature}
          onChange={(e) => updateOption('temperature', e.target.value)}
          label='Temperature'
          icon={faThermometer2}
          disabled={false}
          name='temperature'
          minValue={-0.1}
          maxValue={2}
          step={0.1}
        />
        <Tooltip
          position='right'
          text='The AI temperature (the randomness of the output) - set to -0.1 to let the AI decide'
          offsetX={15}
          width={150}
        >
          <FontAwesomeIcon icon={faQuestionCircle} />
        </Tooltip>
      </div>
      <hr className='mb-4 mt-6 opacity-20' />
      <Button onclick={restoreOptions}>
        <IconWithElement icon={faRefresh} text={'Restore to default settings'} />
      </Button>
    </div>
  );
}

export default Settings;
