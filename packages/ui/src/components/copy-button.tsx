import * as React from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from './button';
import { cn } from '@longpoint/ui/lib/utils';

export interface CopyButtonProps
  extends Omit<
    React.ComponentProps<typeof Button>,
    'onClick' | 'children' | 'variant' | 'size'
  > {
  /**
   * The text to copy to the clipboard
   */
  value: string;
  /**
   * Optional callback called after successful copy
   */
  onCopy?: () => void;
  /**
   * Custom copy success message
   * @default 'Copied!'
   */
  successMessage?: string;
  /**
   * Duration in milliseconds to show the success state
   * @default 2000
   */
  successDuration?: number;
  /**
   * Show only the icon (no text)
   * @default false
   */
  iconOnly?: boolean;
  /**
   * Custom label for the button when not showing icon only
   * @default 'Copy'
   */
  label?: string;
}

export function CopyButton({
  value,
  onCopy,
  successMessage = 'Copied!',
  successDuration = 2000,
  iconOnly = false,
  label = 'Copy',
  className,
  ...props
}: CopyButtonProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      onCopy?.();

      setTimeout(() => {
        setCopied(false);
      }, successDuration);
    } catch (error) {
      // Fallback for older browsers or non-secure contexts
      const textArea = document.createElement('textarea');
      textArea.value = value;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      try {
        document.execCommand('copy');
        setCopied(true);
        onCopy?.();

        setTimeout(() => {
          setCopied(false);
        }, successDuration);
      } catch (err) {
        console.error('Failed to copy:', err);
      } finally {
        document.body.removeChild(textArea);
      }
    }
  };

  return (
    <Button
      variant="ghost"
      size={iconOnly ? 'icon-sm' : 'sm'}
      onClick={handleCopy}
      className={cn(
        'shrink-0',
        copied && 'text-green-600 dark:text-green-400',
        className
      )}
      {...props}
    >
      {copied ? (
        <>
          <Check className="h-4 w-4" />
          {!iconOnly && <span>{successMessage}</span>}
        </>
      ) : (
        <>
          <Copy className="h-4 w-4" />
          {!iconOnly && <span>{label}</span>}
        </>
      )}
    </Button>
  );
}

