import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@longpoint/ui/components/tabs';
import { BellIcon, BotIcon, BoxIcon, SettingsIcon } from 'lucide-react';
import { AiSettings } from './ai-settings/ai-settings';
import { GeneralSettings } from './general-settings';
import { NotificationSettings } from './notification-settings';
import { StorageSettings } from './storage-settings';

export function Settings() {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Settings</h2>
      <Tabs defaultValue="general">
        <TabsList className="mb-6">
          <TabsTrigger value="general">
            <SettingsIcon className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="storage">
            <BoxIcon className="h-4 w-4" />
            Storage
          </TabsTrigger>
          <TabsTrigger value="ai">
            <BotIcon className="h-4 w-4" />
            Intelligence
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <BellIcon className="h-4 w-4" />
            Notifications
          </TabsTrigger>
        </TabsList>
        <TabsContent value="general">
          <GeneralSettings />
        </TabsContent>
        <TabsContent value="storage">
          <StorageSettings />
        </TabsContent>
        <TabsContent value="ai">
          <AiSettings />
        </TabsContent>
        <TabsContent value="notifications">
          <NotificationSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
