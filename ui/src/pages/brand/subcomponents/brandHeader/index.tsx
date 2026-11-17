import { ArrowRightIcon, DownloadIcon } from "@radix-ui/react-icons";
import { Button } from "@radix-ui/themes";
import { Link } from "react-router-dom";

import { brandSections } from "@assets/data";
import BrandMark from "@components/brandMark";

import { Actions, Bar, Container, NavLink, NavList, Top } from "./styles";

const BrandHeader: React.FC = () => (
  <Bar>
    <Container>
      <Top>
        <Link to="/" aria-label="Ir para o painel do PocketRun">
          <BrandMark size={17} />
        </Link>
        <Actions>
          <Button asChild variant="soft" color="gray" highContrast>
            <a href="#downloads">
              <DownloadIcon />
              Baixar logos
            </a>
          </Button>
          <Button asChild highContrast>
            <Link to="/">
              Abrir o painel
              <ArrowRightIcon />
            </Link>
          </Button>
        </Actions>
      </Top>
      <NavList aria-label="Seções do manual de marca">
        {brandSections.map((section) => (
          <NavLink key={section.id} href={`#${section.id}`}>
            <span>{section.number}</span>
            {section.label}
          </NavLink>
        ))}
      </NavList>
    </Container>
  </Bar>
);

export default BrandHeader;
