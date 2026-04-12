import { useContext } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router";
import { signIn } from "../../services/authService.js";
import { UserContext } from "../../contexts/UserContext.jsx";
import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "../../../components/ui/field";
import { Input } from "../../../components/ui/input";

const signInSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

const SignInForm = () => {
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);

  const form = useForm({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      username: "",
      password: "",
    },
    mode: "onChange",
    reValidateMode: "onChange",
  });

  const onSubmit = async (data) => {
    form.clearErrors("root");
    try {
      const signedInUser = await signIn(data);
      setUser(signedInUser);
      navigate("/explore/exercises");
    } catch (err) {
      form.setError("root", { type: "server", message: err.message });
    }
  };

  return (
    <div className="signin-page h-full py-[15vh]">
      <div className="signin-container w-full flex justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Sign in</CardTitle>
            <CardDescription>
              Enter your username and password to continue.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {form.formState.errors.root && (
              <p className="text-destructive mb-4 text-sm" role="alert">
                {form.formState.errors.root.message}
              </p>
            )}

            <form
              id="signin-form"
              className="space-y-0"
              autoComplete="off"
              onSubmit={form.handleSubmit(onSubmit)}
              noValidate
            >
              <FieldGroup className="gap-6">
                <Controller
                  name="username"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="signin-username">Username</FieldLabel>
                      <Input
                        {...field}
                        id="signin-username"
                        autoComplete="username"
                        placeholder="username"
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  name="password"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="signin-password">Password</FieldLabel>
                      <Input
                        {...field}
                        id="signin-password"
                        type="password"
                        autoComplete="current-password"
                        placeholder="••••••••"
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </FieldGroup>
            </form>
          </CardContent>
          <CardFooter>
            <Field className="w-full flex flex-row flex-wrap gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/")}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                form="signin-form"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? "Signing in…" : "Sign in"}
              </Button>
            </Field>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default SignInForm;