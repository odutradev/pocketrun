import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import { createLocalLogger, getErrorMessage } from "@utils/functions";
import { getLink, listLinkGroups } from "@actions/links";

import type { Link, LinkGroup } from "@utils/types/link";
import type { UseLinkEditorPageReturn } from "./types";

const logger = createLocalLogger("linkEditorPage");

const useLinkEditorPage = (): UseLinkEditorPageReturn => {
  const { linkId } = useParams();
  const [link, setLink] = useState<Link | null>(null);
  const [groups, setGroups] = useState<LinkGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasFailed, setHasFailed] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    const load = async () => {
      setIsLoading(true);
      setHasFailed(false);
      try {
        const [loadedGroups, loadedLink] = await Promise.all([
          listLinkGroups(controller.signal),
          linkId ? getLink(linkId, controller.signal) : Promise.resolve(null)
        ]);
        setGroups(loadedGroups);
        setLink(loadedLink);
      } catch (error) {
        if (controller.signal.aborted) return;
        logger.error(error);
        setHasFailed(true);
        toast.error(getErrorMessage(error, "Não foi possível carregar o link"));
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };

    load();
    return () => controller.abort();
  }, [linkId]);

  const handleGroupCreated = (group: LinkGroup) =>
    setGroups((current) => [...current, group].sort((a, b) => a.name.localeCompare(b.name, "pt-BR")));

  return { linkId, link, groups, isLoading, hasFailed, handleGroupCreated };
};

export default useLinkEditorPage;
