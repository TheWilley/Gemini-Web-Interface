import { faHeader, faHistory, faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import Input from '../components/Input';
import Tooltip from '../components/Tooltip';
import { Options } from '../global/types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

function Settings({
  options,
  updateOption,
}: {
  options: Options;
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
          minValue={2}
        />
        <Tooltip
          position='right'
          text='How many previous messages the AI remembers when generating its next response'
          offsetX={15}
          maxWidth={150}
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
          name=''
        />
        <Tooltip
          position='right'
          text='The prompt that should be used to generate a chat name, [n] is replaced with the first message sent by the AI - leave blank to disable name generation'
          offsetX={15}
          maxWidth={150}
        >
          <FontAwesomeIcon icon={faQuestionCircle} />
        </Tooltip>
      </div>
    </div>
  );
}

export default Settings;
