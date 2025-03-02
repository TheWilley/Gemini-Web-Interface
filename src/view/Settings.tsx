import { faHistory } from '@fortawesome/free-solid-svg-icons';
import Input from '../components/Input';
import Tooltip from '../components/Tooltip';
import { Options } from '../global/types';

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

      <Tooltip
        position='right'
        text='How many previous messages the AI remembers when generating its next response'
        offsetX={15}
      >
        <Input
          type='number'
          value={options.numRememberPreviousMessages}
          onChange={(e) => updateOption('numRememberPreviousMessages', e.target.value)}
          label='Previous Messages'
          icon={faHistory}
          disabled={false}
          name=''
          minValue={2}
        />
      </Tooltip>
    </div>
  );
}

export default Settings;
