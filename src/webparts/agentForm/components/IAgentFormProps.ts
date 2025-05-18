export interface IAgentFormProps {
  description: string;
}

export interface IAgentFormState {
  parent_GUID: string;
}

export interface FormProps {
  parent_GUID: string;
}

export interface FormState {
  item_GUID: string;
  Event_Type: string;
  Order_Status: string;
}

export interface ShownFormProps {
  Event_Type: string;
  Order_Status: string;
  Description: string;
  Display_Name: string;
  Created: string;
  item_GUID: string;
  parent_GUID: string;
}
