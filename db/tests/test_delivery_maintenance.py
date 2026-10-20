import importlib.util
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

s=importlib.util.spec_from_file_location('delivery',Path(__file__).parents[1]/'scripts/deliver_submissions.py')
m=importlib.util.module_from_spec(s);s.loader.exec_module(m)


class MaintenanceTests(unittest.TestCase):
    def test_marker_is_checked_after_delivery_lock_before_any_delivery(self):
        events=[]
        with tempfile.TemporaryDirectory() as directory:
            def acquired(*args):events.append('lock')
            def marker(path):
                self.assertEqual(path,'/etc/ftyp/maintenance.json')
                self.assertEqual(events,['lock'])
                return True
            with patch.object(m.fcntl,'flock',side_effect=acquired), \
                 patch.object(m.os.path,'lexists',side_effect=marker), \
                 patch.object(m,'_deliver') as deliver:
                with self.assertRaisesRegex(RuntimeError,'maintenance is active'):
                    m.deliver('fixture','weds',directory)
                deliver.assert_not_called()

    def test_absent_marker_preserves_existing_delivery_arguments(self):
        with tempfile.TemporaryDirectory() as directory, \
             patch.object(m.os.path,'lexists',return_value=False), \
             patch.object(m,'_deliver',return_value={'state':'fixture'}) as deliver:
            self.assertEqual(m.deliver('fixture','sun',directory),{'state':'fixture'})
            deliver.assert_called_once_with('fixture','sun',Path(directory))


if __name__=='__main__':unittest.main()
