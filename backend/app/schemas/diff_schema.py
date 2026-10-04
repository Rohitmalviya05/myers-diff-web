from pydantic import BaseModel, Field

class DiffRequest(BaseModel):
    original: str = Field(max_length=500_000)
    modified: str = Field(max_length=500_000)
    character_diff: bool = True

class DiffBlock(BaseModel):
    type: str
    lines: list[str]
    old_start: int | None = None
    new_start: int | None = None

class DiffResponse(BaseModel):
    blocks: list[DiffBlock]
    stats: dict[str, int]
    identical: bool
