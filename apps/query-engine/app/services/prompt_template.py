from dataclasses import dataclass


@dataclass(frozen=True)
class PromptTemplate:
    template: str

    @classmethod
    def from_template(cls, template: str) -> "PromptTemplate":
        return cls(template=template)

    def format(self, **kwargs: object) -> str:
        return self.template.format(**kwargs)
