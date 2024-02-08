import React, { memo, useState, useEffect } from "react";
import { IGoogleAuthCredential } from "../../../../types/requests/body";
import pluginId from "../../pluginId";
import {
  Box,
  Link,
  Button,
  Flex,
  Alert,
  LinkButton,
} from "@strapi/design-system";
import { BaseHeaderLayout } from "@strapi/design-system/Layout";
import { Typography } from "@strapi/design-system/Typography";
import { GridLayout } from "@strapi/design-system/Layout";
import { TextInput } from "@strapi/design-system/TextInput";
import { Write, Lock, Plus } from "@strapi/icons";
import axiosInstance from "../../utils/axiosInstance";
// import axiosInstance from "../../utils/axiosInstance";

const HomePage = () => {
  const [clientID, setClientID] = useState("");
  const [loading, setLoading] = useState(false);

  const [alert, setAlert] = useState<{
    variant: "success" | "danger";
    content: string;
    title: string;
  } | null>(null);

  const [error, setError] = useState<string | null>(null);

  function handleClientID(event: React.ChangeEvent<HTMLInputElement>) {
    const clientIdValue = event.target.value.trim();

    setClientID(clientIdValue);
    if (clientIdValue.endsWith("apps.googleusercontent.com")) {
      setError(null);
    } else {
      setError("Client ID must end with apps.googleusercontent.com");
    }
  }

  async function fetchCredential() {
    try {
      const { data }: { data: IGoogleAuthCredential } = await axiosInstance.get(
        `/${pluginId}/credentials`
      );

      const clientIdValue = data.client_id;

      setClientID(clientIdValue);

      if (clientIdValue.endsWith("apps.googleusercontent.com")) {
        setError(null);
      } else {
        setError("Client ID must end with apps.googleusercontent.com");
      }
    } catch (error) {
      console.error(error);
      setClientID("");
    }
  }

  async function handleSubmit(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    setLoading(true);
    try {
      const res: { data: { ok: boolean } } = await axiosInstance.post(
        `/${pluginId}/credentials/add`,
        {
          clientID,
        }
      );
      if (res.data.ok) {
        setAlert({
          variant: "success",
          content: "Credentials updated successfully",
          title: "Success",
        });
      } else {
        setAlert({
          variant: "danger",
          content: "Failed to update credentials",
          title: "Error",
        });
      }

      setLoading(false);
    } catch (error) {
      setAlert({
        variant: "danger",
        content: "Failed to update credentials",
        title: "Error",
      });
      setLoading(false);
      console.error(error);
    }
  }

  useEffect(() => {
    fetchCredential();
  }, []);

  return (
    <div>
      <Box padding={8} background="primary100">
        <BaseHeaderLayout
          navigationAction={
            <Link isExternal href="https://kirwako.com">
              kirwako.
            </Link>
          }
          primaryAction={
            <LinkButton
              startIcon={<Plus />}
              size="L"
              variant="default"
              href="https://console.cloud.google.com/projectcreate?previousPage=%2Fcloud-resource-manager%3Fproject%3D%26folder%3D%26organizationId%3D"
            >
              Create Google Project
            </LinkButton>
          }
          title="Google Authenticator"
          subtitle="By kirwako."
          as="h2"
        />
      </Box>

      <Box padding={8} background="neutral100">
        <Box padding={4}>
          {alert && (
            <Alert
              closeLabel="Close"
              title={alert.title}
              variant={alert.variant}
              onClose={() => {
                setAlert(null);
              }}
            >
              {alert.content}
            </Alert>
          )}
        </Box>
        <Box padding={4}>
          <Typography variant="beta">
            Add/Update your Google Project Details.
          </Typography>
        </Box>
        <GridLayout>
          <Box padding={4} hasRadius background="neutral0" shadow="tableShadow">
            <TextInput
              required
              placeholder="*.apps.googleusercontent.com"
              label="Google Client ID"
              name="content"
              hint="Ends with apps.googleusercontent.com"
              error={error}
              onChange={handleClientID}
              value={clientID}
            />
          </Box>
        </GridLayout>
        <Flex marginTop={4} justifyContent="end">
          <Button
            loading={loading}
            onClick={handleSubmit}
            size="L"
            endIcon={<Lock />}
            variant="default"
            disabled={!clientID || error !== null}
          >
            Save Credentials
          </Button>
        </Flex>
      </Box>
    </div>
  );
};

export default memo(HomePage);
