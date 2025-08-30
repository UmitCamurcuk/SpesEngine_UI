import React from 'react';

// Import all attribute components
import {
  TextTableDisplay,
  TextEditInput,
  TextDetailDisplay
} from './DynamicDisplay/TextAttribute';

import {
  NumberTableDisplay,
  NumberEditInput,
  NumberDetailDisplay
} from './DynamicDisplay/NumberAttribute';

import {
  BooleanTableDisplay,
  BooleanEditInput,
  BooleanDetailDisplay
} from './DynamicDisplay/BooleanAttribute';

import {
  EmailTableDisplay,
  EmailEditInput,
  EmailDetailDisplay
} from './DynamicDisplay/EmailAttribute';

import {
  UrlTableDisplay,
  UrlEditInput,
  UrlDetailDisplay
} from './DynamicDisplay/UrlAttribute';

import {
  DateTableDisplay,
  DateEditInput,
  DateDetailDisplay
} from './DynamicDisplay/DateAttribute';

import {
  DateTimeTableDisplay,
  DateTimeEditInput,
  DateTimeDetailDisplay
} from './DynamicDisplay/DateTimeAttribute';

import {
  TimeTableDisplay,
  TimeEditInput,
  TimeDetailDisplay
} from './DynamicDisplay/TimeAttribute';

import {
  SelectTableDisplay,
  SelectEditInput,
  SelectDetailDisplay
} from './DynamicDisplay/SelectAttribute';

import {
  MultiSelectTableDisplay,
  MultiSelectEditInput,
  MultiSelectDetailDisplay
} from './DynamicDisplay/MultiSelectAttribute';

import {
  TableTableDisplay,
  TableEditInput,
  TableDetailDisplay
} from './DynamicDisplay/TableAttribute';

import {
  TextareaTableDisplay,
  TextareaEditInput,
  TextareaDetailDisplay
} from './DynamicDisplay/TextareaAttribute';

import {
  FileTableDisplay,
  FileEditInput,
  FileDetailDisplay
} from './DynamicDisplay/FileAttribute';

import {
  ImageTableDisplay,
  ImageEditInput,
  ImageDetailDisplay
} from './DynamicDisplay/ImageAttribute';

import {
  AttachmentTableDisplay,
  AttachmentEditInput,
  AttachmentDetailDisplay
} from './DynamicDisplay/AttachmentAttribute';

import {
  ColorTableDisplay,
  ColorEditInput,
  ColorDetailDisplay
} from './DynamicDisplay/ColorAttribute';

import {
  RatingTableDisplay,
  RatingEditInput,
  RatingDetailDisplay
} from './DynamicDisplay/RatingAttribute';

import {
  ReadonlyTableDisplay,
  ReadonlyEditInput,
  ReadonlyDetailDisplay
} from './DynamicDisplay/ReadonlyAttribute';

import {
  PhoneTableDisplay,
  PhoneEditInput,
  PhoneDetailDisplay
} from './DynamicDisplay/PhoneAttribute';

import {
  PasswordTableDisplay,
  PasswordEditInput,
  PasswordDetailDisplay
} from './DynamicDisplay/PasswordAttribute';

import {
  RichTextTableDisplay,
  RichTextEditInput,
  RichTextDetailDisplay
} from './DynamicDisplay/RichTextAttribute';

import {
  BarcodeTableDisplay,
  BarcodeEditInput,
  BarcodeDetailDisplay
} from './DynamicDisplay/BarcodeAttribute';

import {
  QrTableDisplay,
  QrEditInput,
  QrDetailDisplay
} from './DynamicDisplay/QrAttribute';

import {
  ObjectTableDisplay,
  ObjectEditInput,
  ObjectDetailDisplay
} from './DynamicDisplay/ObjectAttribute';

import {
  ArrayTableDisplay,
  ArrayEditInput,
  ArrayDetailDisplay
} from './DynamicDisplay/ArrayAttribute';

import {
  JsonTableDisplay,
  JsonEditInput,
  JsonDetailDisplay
} from './DynamicDisplay/JsonAttribute';

import {
  FormulaTableDisplay,
  FormulaEditInput,
  FormulaDetailDisplay
} from './DynamicDisplay/FormulaAttribute';

import {
  ExpressionTableDisplay,
  ExpressionEditInput,
  ExpressionDetailDisplay
} from './DynamicDisplay/ExpressionAttribute';

// Common interface for all attribute components
interface AttributeDisplayProps {
  attribute: any;
  value: any;
  onChange?: (value: any) => void;
  error?: string;
  disabled?: boolean;
  isEditing?: boolean;
}

// Display type enum
export type DisplayType = 'table' | 'edit' | 'detail';

// Main component that returns the appropriate component based on display type
export const AttributeDisplay: React.FC<AttributeDisplayProps & { displayType: DisplayType }> = ({
  attribute,
  value,
  onChange,
  error,
  disabled = false,
  isEditing = false,
  displayType
}) => {
  // Get the appropriate component based on attribute type and display type
  const getComponent = (type: string, displayType: DisplayType) => {
    switch (type) {
      case 'text':
      case 'string':
        switch (displayType) {
          case 'table': return TextTableDisplay;
          case 'edit': return TextEditInput;
          case 'detail': return TextDetailDisplay;
          default: return TextTableDisplay;
        }
      
      case 'number':
      case 'integer':
      case 'decimal':
        switch (displayType) {
          case 'table': return NumberTableDisplay;
          case 'edit': return NumberEditInput;
          case 'detail': return NumberDetailDisplay;
          default: return NumberTableDisplay;
        }
      
      case 'boolean':
        switch (displayType) {
          case 'table': return BooleanTableDisplay;
          case 'edit': return BooleanEditInput;
          case 'detail': return BooleanDetailDisplay;
          default: return BooleanTableDisplay;
        }
      
      case 'email':
        switch (displayType) {
          case 'table': return EmailTableDisplay;
          case 'edit': return EmailEditInput;
          case 'detail': return EmailDetailDisplay;
          default: return EmailTableDisplay;
        }
      
      case 'url':
        switch (displayType) {
          case 'table': return UrlTableDisplay;
          case 'edit': return UrlEditInput;
          case 'detail': return UrlDetailDisplay;
          default: return UrlTableDisplay;
        }
      
      case 'date':
        switch (displayType) {
          case 'table': return DateTableDisplay;
          case 'edit': return DateEditInput;
          case 'detail': return DateDetailDisplay;
          default: return DateTableDisplay;
        }
      
      case 'datetime':
        switch (displayType) {
          case 'table': return DateTimeTableDisplay;
          case 'edit': return DateTimeEditInput;
          case 'detail': return DateTimeDetailDisplay;
          default: return DateTimeTableDisplay;
        }
      
      case 'time':
        switch (displayType) {
          case 'table': return TimeTableDisplay;
          case 'edit': return TimeEditInput;
          case 'detail': return TimeDetailDisplay;
          default: return TimeTableDisplay;
        }
      
      case 'select':
        switch (displayType) {
          case 'table': return SelectTableDisplay;
          case 'edit': return SelectEditInput;
          case 'detail': return SelectDetailDisplay;
          default: return SelectTableDisplay;
        }
      
      case 'multiselect':
        switch (displayType) {
          case 'table': return MultiSelectTableDisplay;
          case 'edit': return MultiSelectEditInput;
          case 'detail': return MultiSelectDetailDisplay;
          default: return MultiSelectTableDisplay;
        }
      
      case 'table':
        switch (displayType) {
          case 'table': return TableTableDisplay;
          case 'edit': return TableEditInput;
          case 'detail': return TableDetailDisplay;
          default: return TableTableDisplay;
        }
      
      case 'textarea':
      case 'multiline':
        switch (displayType) {
          case 'table': return TextareaTableDisplay;
          case 'edit': return TextareaEditInput;
          case 'detail': return TextareaDetailDisplay;
          default: return TextareaTableDisplay;
        }
      
      case 'file':
        switch (displayType) {
          case 'table': return FileTableDisplay;
          case 'edit': return FileEditInput;
          case 'detail': return FileDetailDisplay;
          default: return FileTableDisplay;
        }
      
      case 'image':
        switch (displayType) {
          case 'table': return ImageTableDisplay;
          case 'edit': return ImageEditInput;
          case 'detail': return ImageDetailDisplay;
          default: return ImageTableDisplay;
        }
      
      case 'attachment':
        switch (displayType) {
          case 'table': return AttachmentTableDisplay;
          case 'edit': return AttachmentEditInput;
          case 'detail': return AttachmentDetailDisplay;
          default: return AttachmentTableDisplay;
        }
      
      case 'color':
        switch (displayType) {
          case 'table': return ColorTableDisplay;
          case 'edit': return ColorEditInput;
          case 'detail': return ColorDetailDisplay;
          default: return ColorTableDisplay;
        }
      
      case 'rating':
        switch (displayType) {
          case 'table': return RatingTableDisplay;
          case 'edit': return RatingEditInput;
          case 'detail': return RatingDetailDisplay;
          default: return RatingTableDisplay;
        }
      
      case 'readonly':
        switch (displayType) {
          case 'table': return ReadonlyTableDisplay;
          case 'edit': return ReadonlyEditInput;
          case 'detail': return ReadonlyDetailDisplay;
          default: return ReadonlyTableDisplay;
        }
      
      case 'phone':
        switch (displayType) {
          case 'table': return PhoneTableDisplay;
          case 'edit': return PhoneEditInput;
          case 'detail': return PhoneDetailDisplay;
          default: return PhoneTableDisplay;
        }
      
      case 'password':
        switch (displayType) {
          case 'table': return PasswordTableDisplay;
          case 'edit': return PasswordEditInput;
          case 'detail': return PasswordDetailDisplay;
          default: return PasswordTableDisplay;
        }
      
      case 'rich_text':
        switch (displayType) {
          case 'table': return RichTextTableDisplay;
          case 'edit': return RichTextEditInput;
          case 'detail': return RichTextDetailDisplay;
          default: return RichTextTableDisplay;
        }
      
      case 'barcode':
        switch (displayType) {
          case 'table': return BarcodeTableDisplay;
          case 'edit': return BarcodeEditInput;
          case 'detail': return BarcodeDetailDisplay;
          default: return BarcodeTableDisplay;
        }
      
      case 'qr':
        switch (displayType) {
          case 'table': return QrTableDisplay;
          case 'edit': return QrEditInput;
          case 'detail': return QrDetailDisplay;
          default: return QrTableDisplay;
        }
      
      case 'object':
        switch (displayType) {
          case 'table': return ObjectTableDisplay;
          case 'edit': return ObjectEditInput;
          case 'detail': return ObjectDetailDisplay;
          default: return ObjectTableDisplay;
        }
      
      case 'array':
        switch (displayType) {
          case 'table': return ArrayTableDisplay;
          case 'edit': return ArrayEditInput;
          case 'detail': return ArrayDetailDisplay;
          default: return ArrayTableDisplay;
        }
      
      case 'json':
        switch (displayType) {
          case 'table': return JsonTableDisplay;
          case 'edit': return JsonEditInput;
          case 'detail': return JsonDetailDisplay;
          default: return JsonTableDisplay;
        }
      
      case 'formula':
        switch (displayType) {
          case 'table': return FormulaTableDisplay;
          case 'edit': return FormulaEditInput;
          case 'detail': return FormulaDetailDisplay;
          default: return FormulaTableDisplay;
        }
      
      case 'expression':
        switch (displayType) {
          case 'table': return ExpressionTableDisplay;
          case 'edit': return ExpressionEditInput;
          case 'detail': return ExpressionDetailDisplay;
          default: return ExpressionTableDisplay;
        }
      
      default:
        // Default to text components
        switch (displayType) {
          case 'table': return TextTableDisplay;
          case 'edit': return TextEditInput;
          case 'detail': return TextDetailDisplay;
          default: return TextTableDisplay;
        }
    }
  };

  const Component = getComponent(attribute.type, displayType);

  return (
    <Component
      attribute={attribute}
      value={value}
      onChange={onChange}
      error={error}
      disabled={disabled}
      isEditing={isEditing}
    />
  );
};

// Convenience components for each display type
export const AttributeTableDisplay: React.FC<AttributeDisplayProps> = (props) => (
  <AttributeDisplay {...props} displayType="table" />
);

export const AttributeEditInput: React.FC<AttributeDisplayProps> = (props) => (
  <AttributeDisplay {...props} displayType="edit" />
);

export const AttributeDetailDisplay: React.FC<AttributeDisplayProps> = (props) => (
  <AttributeDisplay {...props} displayType="detail" />
);

// Export all individual components for direct use if needed
export {
  // Text
  TextTableDisplay,
  TextEditInput,
  TextDetailDisplay,
  
  // Number
  NumberTableDisplay,
  NumberEditInput,
  NumberDetailDisplay,
  
  // Boolean
  BooleanTableDisplay,
  BooleanEditInput,
  BooleanDetailDisplay,
  
  // Email
  EmailTableDisplay,
  EmailEditInput,
  EmailDetailDisplay,
  
  // URL
  UrlTableDisplay,
  UrlEditInput,
  UrlDetailDisplay,
  
  // Date
  DateTableDisplay,
  DateEditInput,
  DateDetailDisplay,
  
  // DateTime
  DateTimeTableDisplay,
  DateTimeEditInput,
  DateTimeDetailDisplay,
  
  // Time
  TimeTableDisplay,
  TimeEditInput,
  TimeDetailDisplay,
  
  // Select
  SelectTableDisplay,
  SelectEditInput,
  SelectDetailDisplay,
  
  // MultiSelect
  MultiSelectTableDisplay,
  MultiSelectEditInput,
  MultiSelectDetailDisplay,
  
  // Table
  TableTableDisplay,
  TableEditInput,
  TableDetailDisplay,
  
  // Textarea
  TextareaTableDisplay,
  TextareaEditInput,
  TextareaDetailDisplay,
  
  // File
  FileTableDisplay,
  FileEditInput,
  FileDetailDisplay,
  
  // Image
  ImageTableDisplay,
  ImageEditInput,
  ImageDetailDisplay,
  
  // Attachment
  AttachmentTableDisplay,
  AttachmentEditInput,
  AttachmentDetailDisplay,
  
  // Color
  ColorTableDisplay,
  ColorEditInput,
  ColorDetailDisplay,
  
  // Rating
  RatingTableDisplay,
  RatingEditInput,
  RatingDetailDisplay,
  
  // Readonly
  ReadonlyTableDisplay,
  ReadonlyEditInput,
  ReadonlyDetailDisplay,
  
  // Phone
  PhoneTableDisplay,
  PhoneEditInput,
  PhoneDetailDisplay,
  
  // Password
  PasswordTableDisplay,
  PasswordEditInput,
  PasswordDetailDisplay,
  
  // RichText
  RichTextTableDisplay,
  RichTextEditInput,
  RichTextDetailDisplay,
  
  // Barcode
  BarcodeTableDisplay,
  BarcodeEditInput,
  BarcodeDetailDisplay,
  
  // QR
  QrTableDisplay,
  QrEditInput,
  QrDetailDisplay,
  
  // Object
  ObjectTableDisplay,
  ObjectEditInput,
  ObjectDetailDisplay,
  
  // Array
  ArrayTableDisplay,
  ArrayEditInput,
  ArrayDetailDisplay,
  
  // JSON
  JsonTableDisplay,
  JsonEditInput,
  JsonDetailDisplay,
  
  // Formula
  FormulaTableDisplay,
  FormulaEditInput,
  FormulaDetailDisplay,
  
  // Expression
  ExpressionTableDisplay,
  ExpressionEditInput,
  ExpressionDetailDisplay
};
